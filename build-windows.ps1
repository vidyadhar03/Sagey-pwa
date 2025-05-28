# Windows Build Script for Sagey PWA
# This script handles Windows-specific build issues and permission problems

Write-Host "Starting Windows build process..." -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Continue"

# Function to safely remove directory
function Remove-DirectorySafely {
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Host "Removing $Path..." -ForegroundColor Yellow
        try {
            # First try normal removal
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Host "Successfully removed $Path" -ForegroundColor Green
        }
        catch {
            Write-Host "Normal removal failed, trying alternative method..." -ForegroundColor Yellow
            try {
                # Alternative method using robocopy to clear directory
                $emptyDir = Join-Path $env:TEMP "empty_$(Get-Random)"
                New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
                robocopy $emptyDir $Path /MIR /R:0 /W:0 | Out-Null
                Remove-Item -Path $Path -Force -ErrorAction Stop
                Remove-Item -Path $emptyDir -Force -ErrorAction SilentlyContinue
                Write-Host "Successfully removed $Path using alternative method" -ForegroundColor Green
            }
            catch {
                Write-Host "Warning: Could not remove $Path - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Clean up build artifacts
Write-Host "Cleaning build artifacts..." -ForegroundColor Cyan
Remove-DirectorySafely ".next"
Remove-DirectorySafely "node_modules\.cache"

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force 2>$null

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:DISABLE_OPENCOLLECTIVE = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:CI = "true"

Write-Host "Environment variables set:" -ForegroundColor Cyan
Write-Host "  NEXT_TELEMETRY_DISABLED: $env:NEXT_TELEMETRY_DISABLED"
Write-Host "  DISABLE_OPENCOLLECTIVE: $env:DISABLE_OPENCOLLECTIVE"
Write-Host "  NODE_OPTIONS: $env:NODE_OPTIONS"
Write-Host "  CI: $env:CI"

# Run the build
Write-Host "Starting Next.js build..." -ForegroundColor Green
try {
    & npm run build:standard
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
catch {
    Write-Host "Build failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Windows build process completed!" -ForegroundColor Green 