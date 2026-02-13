@echo off
set "CACHE_BASE=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1"
set "LOCAL_BASE=nsis_env"

echo Preparing local NSIS environment...

if not exist "%LOCAL_BASE%\Include" mkdir "%LOCAL_BASE%\Include"
if not exist "%LOCAL_BASE%\Contrib" mkdir "%LOCAL_BASE%\Contrib"

echo Copying Include files...
robocopy "%CACHE_BASE%\Include" "%LOCAL_BASE%\Include" /E /NFL /NDL >nul

echo Copying Contrib files...
robocopy "%CACHE_BASE%\Contrib" "%LOCAL_BASE%\Contrib" /E /NFL /NDL >nul

echo [OK] NSIS Environment Ready in %LOCAL_BASE%
