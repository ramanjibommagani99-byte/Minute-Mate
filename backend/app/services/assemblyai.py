import asyncio
import re

import httpx
from fastapi import HTTPException, status

from app.core.config import settings

BASE_URL = "https://api.assemblyai.com/v2"
POLL_INTERVAL_SECONDS = 3
MAX_POLL_ATTEMPTS = 60
SENTENCE_END = re.compile(r"[.!?][\"')\]]*$")


def _format_timestamped_words(words: object, fallback_text: str) -> str:
    """Preserve default word-level times as source markers without paid options."""
    if not isinstance(words, list) or not words:
        return fallback_text.strip()
    lines: list[str] = []
    sentence: list[str] = []
    sentence_start: int | None = None
    for item in words:
        if not isinstance(item, dict) or not isinstance(item.get("text"), str):
            continue
        token = item["text"].strip()
        start = item.get("start")
        if not token or not isinstance(start, int) or start < 0:
            continue
        if sentence_start is None:
            sentence_start = start // 1000
        sentence.append(token)
        if SENTENCE_END.search(token):
            lines.append((_render_timestamp(sentence_start) + " " + " ".join(sentence)).strip())
            sentence = []
            sentence_start = None
    if sentence and sentence_start is not None:
        lines.append((_render_timestamp(sentence_start) + " " + " ".join(sentence)).strip())
    return "\n".join(lines) if lines else fallback_text.strip()


def _render_timestamp(seconds: int) -> str:
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"[{hours}:{minutes:02}:{seconds:02}]" if hours else f"[{minutes:02}:{seconds:02}]"


def _provider_message(response: httpx.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return ""
    message = body.get("error") if isinstance(body, dict) else ""
    return " ".join(message.split())[:240] if isinstance(message, str) else ""


def _raise_provider_error(response: httpx.Response) -> None:
    message = _provider_message(response)
    if response.status_code in {401, 403}:
        detail = "AssemblyAI rejected the API key or account access. Check ASSEMBLYAI_API_KEY in backend/.env."
    elif response.status_code == 429:
        detail = "AssemblyAI rate limit reached. Wait briefly and try again."
    elif response.status_code == 402:
        detail = "AssemblyAI free-tier allowance may be exhausted. Check the account usage; upgrading is optional and can incur charges."
    elif response.status_code == 400:
        detail = "AssemblyAI rejected the audio request. Check the file format and try again."
    else:
        detail = f"AssemblyAI returned HTTP {response.status_code}. Check the provider status and retry."
    if message:
        detail = f"{detail} Provider detail: {message}"
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


async def transcribe_audio(audio: bytes) -> str:
    if not settings.assemblyai_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Audio transcription is not configured. Set ASSEMBLYAI_API_KEY in backend/.env and restart the backend.",
        )

    headers = {"authorization": settings.assemblyai_api_key}
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            upload_response = await client.post(
                f"{BASE_URL}/upload",
                headers={**headers, "content-type": "application/octet-stream"},
                content=audio,
            )
            if upload_response.is_error:
                _raise_provider_error(upload_response)
            upload_url = upload_response.json().get("upload_url")
            if not isinstance(upload_url, str) or not upload_url:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AssemblyAI did not return an audio upload URL")

            create_response = await client.post(
                f"{BASE_URL}/transcript",
                headers={**headers, "content-type": "application/json"},
                json={
                    "audio_url": upload_url,
                    "speech_models": ["universal-2"],
                    "language_detection": True,
                },
            )
            if create_response.is_error:
                _raise_provider_error(create_response)
            transcript_id = create_response.json().get("id")
            if not isinstance(transcript_id, str) or not transcript_id:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AssemblyAI did not return a transcription job ID")

            for attempt in range(MAX_POLL_ATTEMPTS):
                poll_response = await client.get(f"{BASE_URL}/transcript/{transcript_id}", headers=headers)
                if poll_response.is_error:
                    _raise_provider_error(poll_response)
                result = poll_response.json()
                if result.get("status") == "completed":
                    transcript = result.get("text")
                    if isinstance(transcript, str) and transcript.strip():
                        return _format_timestamped_words(result.get("words"), transcript)
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AssemblyAI completed the job but returned no transcript text")
                if result.get("status") == "error":
                    provider_error = result.get("error")
                    detail = "AssemblyAI could not transcribe this audio. Try a clearer supported audio file."
                    if isinstance(provider_error, str) and provider_error.strip():
                        detail = f"{detail} Provider detail: {' '.join(provider_error.split())[:240]}"
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
                if attempt < MAX_POLL_ATTEMPTS - 1:
                    await asyncio.sleep(POLL_INTERVAL_SECONDS)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AssemblyAI is unavailable. Check your internet connection and retry.") from exc

    raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="AssemblyAI is still processing this recording. Try a shorter audio file.")
