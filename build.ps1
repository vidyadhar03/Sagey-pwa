# Windows Build Script for Sagey PWA
# This script handles build timeouts and provides better error reporting

Write-Host "Starting Sagey PWA Build Process..." -ForegroundColor Green

# Set environment variables for better performance
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CI = "true"

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
}

# Start build process with timeout
Write-Host "Starting Next.js build..." -ForegroundColor Yellow

$buildJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    $env:NEXT_TELEMETRY_DISABLED = "1"
    $env:CI = "true"
    npm run build 2>&1
}

# Wait for build with timeout (10 minutes)
$timeout = 600
$completed = Wait-Job $buildJob -Timeout $timeout

if ($completed) {
    $result = Receive-Job $buildJob
    $exitCode = $buildJob.State
    
    if ($exitCode -eq "Completed") {
        Write-Host "Build completed successfully!" -ForegroundColor Green
        Write-Host $result
        exit 0
    } else {
        Write-Host "Build failed!" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} else {
    Write-Host "Build timed out after $timeout seconds!" -ForegroundColor Red
    Stop-Job $buildJob
    Remove-Job $buildJob
    
    # Kill any hanging Node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    exit 1
}

Remove-Job $buildJob 