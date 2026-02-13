@echo off
chcp 65001 >nul
title SISTEMA GM SYSTEMS - AMBIENTE HIBRIDO COMPLETO

echo =======================================================
echo   INICIANDO SISTEMA COMPLETO (FRONTEND + BACKEND)
echo =======================================================
echo.
echo [1/2] Iniciando Motor Local (Backend)...
start "MOTOR LOCAL (NAO FECHE)" /min cmd /c "cd /d "%~dp0" && node backend/server.js"

echo [2/2] Iniciando Interface (Frontend)...
echo.
echo O navegador vai abrir em instantes...
echo.

call npm run dev

pause
