@echo off
echo ===================================================
echo   DEPLOY RAPIDO VERCEL (FIX MODE)
echo ===================================================
echo.
echo 1. Verificando login...
call npx vercel whoami
if %ERRORLEVEL% NEQ 0 (
    echo Login necessario...
    call npx vercel login
)

echo.
echo 2. Enviando atualizacao para PRD...
call npx vercel --prod
echo.
echo ===================================================
echo   DEPLOY CONCLUIDO!
echo ===================================================
pause
