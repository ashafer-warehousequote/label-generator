@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Always run from this script's directory
cd /d "%~dp0"

echo Starting Label Generator...

REM Verify Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found in PATH.
  echo Please install Node.js 20+ and try again.
  start "" https://nodejs.org/en/download
  pause
  exit /b 1
)

REM Verify npm
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js (includes npm) and try again.
  start "" https://nodejs.org/en/download
  pause
  exit /b 1
)

REM Install dependencies if needed (or ensure present)
if not exist node_modules (
  echo Installing dependencies (first run)...
  call npm install || goto :error
) else (
  echo Ensuring dependencies are installed...
  call npm install || goto :error
)

echo Launching development server and opening your browser...
call npm run dev -- --open
goto :eof

:error
echo.
echo An error occurred. Press any key to exit.
pause >nul
exit /b 1
