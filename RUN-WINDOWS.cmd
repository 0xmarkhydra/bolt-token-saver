@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Bolt Token Saver - Terminal UI
set "NODEBIN=node"
where node >nul 2>&1
if not errorlevel 1 goto :check
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODEBIN=%ProgramFiles%\nodejs\node.exe"
  goto :check
)
echo Node.js 20+ not found.
where winget >nul 2>&1
if errorlevel 1 goto :manual
choice /C YN /N /M "Install Node.js LTS with WinGet? [Y/N]: "
if errorlevel 2 goto :manual
winget install --id OpenJS.NodeJS.LTS --exact --accept-source-agreements --accept-package-agreements
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODEBIN=%ProgramFiles%\nodejs\node.exe"
  goto :check
)
:manual
echo Install Node.js LTS from https://nodejs.org/en/download
pause
exit /b 1
:check
"%NODEBIN%" -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)"
if errorlevel 1 (
 echo Node.js 20+ required.
 pause
 exit /b 1
)
"%NODEBIN%" "%~dp0src\cli.mjs" %*
if errorlevel 1 pause
endlocal
