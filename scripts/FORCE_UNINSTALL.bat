@echo off
echo ===================================================
echo   "FORCE UNINSTALL: GM Systems & Gestao Patrimonial"
echo ===================================================
echo.
echo Stopping running processes...
taskkill /F /IM "GM Systems e Gestão Patrimonial.exe" /T >nul 2>&1

echo.
echo Removing Installation Directory...
if exist "%LOCALAPPDATA%\GM_Systems_ERP" (
    rd /s /q "%LOCALAPPDATA%\GM_Systems_ERP"
    echo [OK] Application files removed.
) else (
    echo [INFO] Application not found in LocalAppData.
)

echo.
echo Removing Shortcuts...
if exist "%USERPROFILE%\Desktop\GM Systems.lnk" (
    del "%USERPROFILE%\Desktop\GM Systems.lnk"
    echo [OK] Desktop shortcut removed.
)
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\GM Systems" (
    rd /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\GM Systems"
    echo [OK] Start Menu directory removed.
)

echo.
echo Removing Registry Keys...
powershell -Command "Remove-Item -Path 'HKCU:\Software\GM_Systems_ERP' -Recurse -ErrorAction SilentlyContinue"
echo [OK] Registry cleaned.

echo.
echo ===================================================
echo   UNINSTALL COMPLETE
echo ===================================================
echo.
