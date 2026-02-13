@echo off
cd /d "%~dp0"
echo ==================================================
echo   SISTEMA G.T - INICIANDO TUDO (SERVIDOR + APP)
echo ==================================================
echo.

echo [1/3] Fechando processos antigos...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM "Sistema G.T Desktop.exe" /T >nul 2>&1

echo.
echo [2/3] Iniciando o Cérebro (Servidor)...
echo Por favor, aguarde 5 segundos...
start "SERVIDO_GT_NAO_FECHE" cmd /c "INICIAR_SERVER.bat"

timeout /t 5 /nobreak >nul

echo.
echo [3/3] Abrindo o Aplicativo...
if exist "dist\win-unpacked\Sistema G.T Desktop.exe" (
    start "" "dist\win-unpacked\Sistema G.T Desktop.exe"
) else (
    echo [ERRO] Nao encontrei o aplicativo na pasta dist\win-unpacked.
    echo Certifique-se que o FULL_BUILD.bat foi concluido.
    pause
    exit
)

echo.
echo ==================================================
echo   PRONTO!
echo   1. Uma janela preta do servidor abrira (MINIMIZE-A, NAO FECHE).
echo   2. O aplicativo abrira em seguida.
echo ==================================================
timeout /t 10
