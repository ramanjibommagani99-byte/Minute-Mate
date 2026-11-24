param(
    [ValidateSet("frontend", "backend", "database")]
    [string]$Service = "frontend"
)

$root = Split-Path -Parent $PSScriptRoot
switch ($Service) {
    "frontend" { Set-Location (Join-Path $root "frontend"); npm run dev }
    "backend" { Set-Location (Join-Path $root "backend"); .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 }
    "database" { Set-Location $root; docker compose up -d db }
}
