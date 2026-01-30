@echo off
setlocal enabledelayedexpansion

rem Static server for Windows. Uses Python launcher if available.
set "PORT=%PORT%"
if "%PORT%"=="" set "PORT=5173"

echo Starting static server on http://localhost:%PORT%
py -3 -m http.server %PORT%
