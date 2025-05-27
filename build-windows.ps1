# Windows-specific build script for Sagey PWA
# This script handles Windows permission issues with Next.js builds

Write-Host "Starting Windows-optimized build process..." -ForegroundColor Green

# Set environment variables to prevent permission issues
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:DISABLE_OPENCOLLECTIVE = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:CI = "true"
$env:NEXT_PRIVATE_STANDALONE = "true"

# Function to safely remove directory
function Remove-DirectorySafely {
    param($Path)
    
    if (Test-Path $Path -ErrorAction SilentlyContinue) {
        try {
            # Try to remove read-only attributes first
            Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                try {
                    $_.Attributes = $_.Attributes -band (-bnot [System.IO.FileAttributes]::ReadOnly)
                } catch {
                    # Ignore attribute errors
                }
            }
            
            # Remove the directory
            Remove-Item -Recurse -Force $Path -ErrorAction Stop
            Write-Host "Successfully removed $Path" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "Could not remove $Path`: $($_.Exception.Message)" -ForegroundColor Yellow
            return $false
        }
    }
    return $true
}

# Clean any existing build artifacts
Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

# Try to stop any processes that might be locking files
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
} catch {
    # Ignore process stop errors
}

# Wait a moment for processes to fully stop
Start-Sleep -Seconds 2

# Remove .next directory safely
if (-not (Remove-DirectorySafely ".next")) {
    Write-Host "Warning: Could not completely clean .next directory. Continuing anyway..." -ForegroundColor Yellow
}

# Remove cache directory
Remove-DirectorySafely "node_modules\.cache" | Out-Null

# Create .next directory with proper permissions
Write-Host "Creating .next directory..." -ForegroundColor Yellow
try {
    New-Item -ItemType Directory -Path ".next" -Force -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Warning: Could not create .next directory: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Start the build process
Write-Host "Starting Next.js build..." -ForegroundColor Yellow

try {
    # Use npm directly to avoid PowerShell execution policy issues
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build:standard" -NoNewWindow -PassThru -Wait
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Build failed with exit code: $($buildProcess.ExitCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Build process encountered an error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 