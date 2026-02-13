@echo off
echo ===================================================
echo   FORCANDO REDEPLOY LIMPO NA VERCEL (SEM CACHE)
echo ===================================================
echo.

cd /d "%~dp0"

echo 1. Limpando cache local do Vercel...
if exist .vercel (
    rmdir /s /q .vercel
)

echo 2. Iniciando Deploy forcado (--force)...
echo.
call npx vercel --prod --force

echo.
echo ===================================================
echo   DEPLOY CONCLUIDO!
echo   Acesse a URL e tente logar novamente.
echo ===================================================
pause
