@echo off
chcp 65001 > nul
cls
echo =======================================================
echo   GERAR EXECUTAVEL FINAL (WINDOWS)
echo =======================================================
echo.
echo 1. Construindo o Frontend (React)...
call npm run build
echo.
echo 2. Criando o Instalador (Electron)...
call npm run dist
echo.
echo SUCESSO! O instalador esta na pasta "release".
pause
