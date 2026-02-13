@echo off
set "NSIS_BASE=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1"
set "NSIS_BIN=%NSIS_BASE%\Bin\makensis.exe"

REM Explicitly set the include path where MUI2.nsh stubs are located
set "NSIS_INC=%NSIS_BASE%\Include"

echo Compiling Professional Installer...
echo Base: %NSIS_BASE%

"%NSIS_BIN%" -NOCD -I"%NSIS_INC%" pro_installer.nsi

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Installer generated in dist folder!
pause
