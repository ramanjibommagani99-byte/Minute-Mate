param(
    [ValidateSet("frontend", "backend", "database")]
    [string]$Service = "frontend"
)

$root = Split-Path -Parent $PSScriptRoot
switch ($Service) {
    "frontend" { Set-Location (Join-Path $root "frontend"); npm run dev }
    "backend" { Set-Location (Join-Path $root "backend"); .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload }
    "database" { Set-Location $root; docker compose up -d db }
}
