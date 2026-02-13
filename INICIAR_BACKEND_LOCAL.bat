@echo off
chcp 65001 > nul
cls
echo =======================================================
echo   INICIANDO BACKEND LOCAL (GM SYSTEMS)
echo =======================================================
echo.
echo Este script simula o servidor Vercel no seu computador.
echo Isso permite testar as correcoes de sincronizacao IMEDIATAMENTE.
echo.
echo Se o Windows Firewall perguntar, clique em "Permitir".
echo.
node local_server.js
pause
