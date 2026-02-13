@echo off
echo ==========================================================
echo   "GM SYSTEMS: PROFESSIONAL BUILD & INSTALLER GENERATION"
echo ==========================================================
echo.

REM 1. FORCE UNINSTALL
call FORCE_UNINSTALL.bat

REM 2. REGENERATE ICON
echo.
echo Copying Icon...
copy "desktop\icon.ico" "desktop\build_icon.ico" /Y

REM 3. COMPILE INSTALLER
echo.
echo Compiling Professional Installer...
set "NSIS_BIN=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe"

"%NSIS_BIN%" manual_installer.nsi

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation Failed!
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo   SUCCESS! Installer Ready:
echo   dist\GM_Systems_Setup_v2.5.0.exe
echo ==========================================================
echo.
pause
