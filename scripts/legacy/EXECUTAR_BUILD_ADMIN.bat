@echo off
cd /d "%~dp0"
TITLE INICIANDO BUILD COMO ADMINISTRADOR (v1.0.1)

echo ========================================================
echo   SOLICITANDO PERMISSOES DE ADMINISTRADOR...
echo   (Se abrir uma janela pedindo Sim/Nao, clique em SIM)
echo ========================================================

:: Usa PowerShell para elevar o processo passando o caminho correto (com aspas para lidar com &)
:: O argumento /k mantem a janela aberta apos a execucao
powershell -Command "Start-Process cmd -ArgumentList '/k \"\"%~dp0BUILD_MANUAL.bat\"\"' -Verb RunAs"

echo.
echo Janela de Build deve ter aberto (fundo preto).
echo Aguarde ela terminar. Se der erro vermelho, me avise.
echo.
pause
