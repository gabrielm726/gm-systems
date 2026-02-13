@echo off
echo ==============================================================================
echo   LIMPEZA PROFUNDA DE CACHE DO ELECTRON
echo ==============================================================================
echo.
echo [1/3] Fechando aplicacao...
taskkill /F /IM "GMSystems.exe" >nul 2>&1
taskkill /F /IM "electron.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Apagando cache do AppData/Roaming...
if exist "%APPDATA%\GM Systems e Gestão Patrimonial" (
    rmdir /s /q "%APPDATA%\GM Systems e Gestão Patrimonial"
    echo    -> Roaming Cache limpo.
)

echo [3/3] Apagando cache do AppData/Local...
if exist "%LOCALAPPDATA%\electron-builder" (
    REM Nao apagamos tudo do electron-builder para nao perder o nsis
    REM rmdir /s /q "%LOCALAPPDATA%\electron-builder"
    echo    -> (Mantendo cache do builder para agilizar)
)

echo.
echo ==============================================================================
echo   LIMPEZA CONCLUIDA!
echo ==============================================================================
echo.
echo Tente rodar 'npm start' ou gerar o instalador novamente.
pause
