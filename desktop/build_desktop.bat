@echo off
cd /d "%~dp0"
echo ==========================================
echo INICIANDO BUILD DESKTOP
echo IMPORTANTE: Execute este arquivo como ADMINISTRADOR se der erro de permissao.
echo Diretorio: %CD%
echo ==========================================
echo.
call npm run dist
echo.
echo Verifique a pasta 'dist' se deu sucesso.
pause
