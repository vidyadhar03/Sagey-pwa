@echo off
REM Windows Build Script for Sagey PWA (Batch Version)
echo Starting Windows build process...

REM Set environment variables
set NEXT_TELEMETRY_DISABLED=1
set DISABLE_OPENCOLLECTIVE=1
set NODE_OPTIONS=--max-old-space-size=8192 --no-warnings
set CI=true
set NODE_NO_WARNINGS=1
set FORCE_COLOR=0
set NPM_CONFIG_PROGRESS=false
set NPM_CONFIG_LOGLEVEL=error

REM Clean up build artifacts
echo Cleaning build artifacts...
if exist .next rmdir /s /q .next 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist dist rmdir /s /q dist 2>nul
if exist out rmdir /s /q out 2>nul

REM Clean npm cache
echo Cleaning npm cache...
npm cache clean --force >nul 2>&1

REM Check Node.js and npm
echo Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found!
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo npm not found!
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm ci --legacy-peer-deps
    if errorlevel 1 (
        echo Dependency installation failed!
        exit /b 1
    )
)

REM Run the build
echo Starting Next.js build...
npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Build completed successfully!
exit /b 0 