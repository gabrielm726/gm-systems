@echo off
cd /d "%~dp0"
TITLE MODO DE TESTE DIRETO - GM SYSTEMS
color 0B
echo ========================================================
echo   INICIANDO MODO DE TESTE (SEM INSTALAR)
echo   Isso vai rodar o sistema direto do codigo fonte.
echo ========================================================
echo.

:: Mate processos antes de começar
call FORCAR_PARADA.bat
cls

echo.
echo Iniciando Electron direto...
echo Se abrir e funcionar, o problema esta APENAS no instalador.
echo.

:: Chamando electron diretamente via node para evitar erro do caractere '&'
node "node_modules\electron\cli.js" .

echo.
echo Teste finalizado.
pause
