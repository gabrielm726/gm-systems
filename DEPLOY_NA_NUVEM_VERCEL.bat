@echo off
chcp 65001 > nul
cls
echo =======================================================
echo   ATUALIZACAO DO SISTEMA GLOBAL (VERCEL API)
echo =======================================================
echo.
echo Este script vai preparar seus arquivos para a Vercel.
echo Certifique-se de ter o Vercel CLI instalado ou use o site.
echo.
echo 1. Instalando dependencias da API...
cd api
call npm install
cd ..

echo.
echo 2. Configurando Vercel...
echo (Se voce nao tem o Vercel CLI, apenas faca o Push no Git)
echo.

echo ATENCAO:
echo Se voce usa o GitHub integrado a Vercel, apenas faça:
echo git add .
echo git commit -m "Fix Vercel API Entry Point"
echo git push
echo.
echo Se usa Vercel CLI:
echo vercel --prod
echo.
pause
