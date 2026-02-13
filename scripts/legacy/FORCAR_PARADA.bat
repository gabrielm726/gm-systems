@echo off
TITLE FORCAR FECHAMENTO - GM SYSTEMS
color 0C
echo ========================================================
echo   ENCERRANDO PROCESSOS TRAVADOS...
echo ========================================================
echo.

:: Mate processos pelo nome do executável da aplicação
taskkill /F /IM "GM Systems & Gestão Patrimonial.exe" /T >nul 2>&1
taskkill /F /IM "GM Systems.exe" /T >nul 2>&1
taskkill /F /IM "Gestão Patrimonial.exe" /T >nul 2>&1

:: Mate processos Electron/Node que podem estar pendurados
taskkill /F /IM "electron.exe" /T >nul 2>&1
taskkill /F /IM "node.exe" /T >nul 2>&1

echo.
echo Processos finalizados.
echo.
echo Tente instalar agora.
pause
