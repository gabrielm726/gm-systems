@echo off
TITLE G.T. GESTAO PATRIMONIAL - LANCAR NOVA VERSAO
color 0A
echo ==================================================
echo   LANCAR NOVA VERSAO (BUILD + START)
echo ==================================================
echo.
echo [1/4] Fechando processos antigos...
taskkill /F /IM "Sistema G.T Desktop.exe" /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
echo.
echo [2/4] Gerando nova versao (BUILD)...
echo Isso pode demorar um pouquinho, aguarde...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao gerar o build. Verifique os erros acima.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/4] Iniciando Servidor Backend...
start "SERVIDO_GT_NAO_FECHE" cmd /c "INICIAR_SERVER.bat"
echo.
echo [4/4] Abrindo Sistema Desktop (Atualizado)...
echo O sistema ira abrir em alguns segundos.
call npm run start
pause
