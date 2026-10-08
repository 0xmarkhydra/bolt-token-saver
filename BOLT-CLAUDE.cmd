@echo off
setlocal
set "PATH=%USERPROFILE%\.local\bin;%PATH%"
where headroom >nul 2>&1 || (echo Install Headroom from RUN-WINDOWS.cmd first. & exit /b 1)
headroom wrap claude %*
endlocal
