# ===========================================
# Mazar Booking - Desktop Build Preparation
# يجهّز مجلد standalone ليعمل كتطبيق سطح مكتب
# ===========================================

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StandaloneDir = Join-Path $ProjectRoot ".next\standalone"
$StaticSrc    = Join-Path $ProjectRoot ".next\static"
$StaticDest   = Join-Path $StandaloneDir ".next\static"
$PublicSrc    = Join-Path $ProjectRoot "public"
$PublicDest   = Join-Path $StandaloneDir "public"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Mazar - Desktop Build Preparation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Check standalone exists
if (-not (Test-Path $StandaloneDir)) {
    Write-Host "[ERROR] .next/standalone not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# 2. Copy .next/static -> .next/standalone/.next/static
Write-Host ""
Write-Host "[1/2] Copying static assets..." -ForegroundColor Yellow
if (Test-Path $StaticDest) {
    Remove-Item -Recurse -Force $StaticDest
}
Copy-Item -Recurse -Force $StaticSrc $StaticDest
Write-Host "      -> $(Get-ChildItem $StaticDest -Recurse -File | Measure-Object).Count files copied." -ForegroundColor Green

# 3. Copy public -> .next/standalone/public
Write-Host ""
Write-Host "[2/2] Copying public folder (images, icons, etc)..." -ForegroundColor Yellow
if (Test-Path $PublicDest) {
    Remove-Item -Recurse -Force $PublicDest
}
Copy-Item -Recurse -Force $PublicSrc $PublicDest
Write-Host "      -> $(Get-ChildItem $PublicDest -Recurse -File | Measure-Object).Count files copied from public/." -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Injecting environment variables..." -ForegroundColor Yellow
if (Test-Path "$ProjectRoot\.env.local") {
    Copy-Item "$ProjectRoot\.env.local" "$StandaloneDir\.env" -Force
    Write-Host "      -> .env.local copied to standalone/.env" -ForegroundColor Green
} else {
    Write-Host "      -> WARNING: .env.local not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Build ready! Run: npm run desktop" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
