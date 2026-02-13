@echo off
chcp 65001 >nul
color 0E
title SERVIDOR LOCAL - GM SYSTEMS (ATIVO)

echo =======================================================
echo   INICIANDO SERVIDOR LOCAL (MODO HIBRIDO)
echo =======================================================
echo.
echo Este servidor garante o funcionamento do sistema mesmo
echo se a nuvem (Vercel) estiver instavel.
echo.
echo [INFO] Conectando ao Banco Global (TiDB)...
echo.

cd /d "%~dp0"
node backend/server.js

echo.
echo [ERRO] O servidor parou. Verifique as mensagens acima.
pause
