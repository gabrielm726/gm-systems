@echo off
set "NSIS_BIN=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe"

REM Run prep script
call PREPARE_NSIS.bat

echo.
echo Compiling Professional Installer using Local Env...
"%NSIS_BIN%" -NOCD pro_installer.nsi

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Installer generated: dist\GM_Systems_Setup_Pro_v2.5.0.exe
