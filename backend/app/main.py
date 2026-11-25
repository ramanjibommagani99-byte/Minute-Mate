from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.meetings import router as meetings_router
from app.api.routes.reminders import router as reminders_router
from app.api.routes.tasks import router as tasks_router
from app.core.config import settings

app = FastAPI(
    title="MinuteMate API",
    description="Meeting-to-action workflow API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for api_prefix in ("", "/api"):
    # Local Next.js rewrites strip /api before forwarding, while Vercel
    # Services forwards the original path. Register both forms so the API
    # works in either deployment path.
    include_in_schema = api_prefix == ""
    app.include_router(
        auth_router,
        prefix=f"{api_prefix}/auth",
        tags=["authentication"],
        include_in_schema=include_in_schema,
    )
    app.include_router(
        meetings_router,
        prefix=f"{api_prefix}/meetings",
        tags=["meetings"],
        include_in_schema=include_in_schema,
    )
    app.include_router(
        tasks_router,
        prefix=f"{api_prefix}/tasks",
        tags=["tasks"],
        include_in_schema=include_in_schema,
    )
    app.include_router(
        reminders_router,
        prefix=api_prefix,
        tags=["reminders"],
        include_in_schema=include_in_schema,
    )


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"], include_in_schema=False)
def health() -> dict[str, str]:
    """Report that the API process is ready to receive requests."""
    return {"status": "ok", "service": "minutemate-api"}
