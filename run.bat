@echo off
setlocal enabledelayedexpansion

rem Static server for Windows. Uses Python launcher if available.
set "PORT=%PORT%"
if "%PORT%"=="" set "PORT=5173"

where py >nul 2>&1
if %errorlevel%==0 (
  echo Starting static server on http://localhost:%PORT%
  py -3 -m http.server %PORT%
  goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
  echo Starting static server on http://localhost:%PORT%
  python -m http.server %PORT%
  goto :eof
)

echo Python no está instalado. Instálalo y vuelve a intentar.
echo Descarga: https://www.python.org/downloads/
