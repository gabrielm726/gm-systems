@echo off
REM ====================================================
REM   DEPLOY NA NUVEM (VERCEL) - GM SYSTEMS (GLOBAL)
REM ====================================================

cd /d "%~dp0"

echo.
echo ====================================================
echo   INICIANDO CONFIGURACAO DA NUVEM (GLOBAL ACCESS)
echo ====================================================
echo.
echo   1. Se pedir para instalar o Vercel CLI, digite "y" e Enter.
echo   2. Se pedir Login, seu navegador vai abrir. Faca login.
echo   3. Depois, va apertando ENTER para todas as perguntas.
echo.
echo   AGUARDE... (Pode demorar uns segundos para iniciar)
echo.

call npx vercel

echo.
echo ====================================================
echo   FIM DO PROCESSO
echo   Se apareceu "Production: https://...", Copie esse LINK!
echo ====================================================
echo.
pause
