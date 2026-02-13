@echo off
cd /d "%~dp0"
echo ========================================================
echo   SISTEMA G.T - GERADOR DE INSTALADORES AUTOMATICO
echo   Diretorio de Execucao: %CD%
echo ========================================================
echo.
echo 1. Limpando cache antigo para evitar erros...
rmdir /s /q "C:\Users\user\AppData\Local\electron-builder\Cache" >nul 2>&1

echo.
echo 2. Iniciando Build MOBILE (Android)...
echo    [Será necessário fazer LOGIN na Expo se solicitado]
echo.
cd mobile
call build_mobile.bat
cd ..

echo.
echo 3. Iniciando Build DESKTOP (Windows)...
echo.
cd desktop
call build_desktop.bat
cd ..

echo.
echo ========================================================
echo   PROCESSO FINALIZADO
echo ========================================================
echo.
echo Verifique se os arquivos foram criados:
echo  - Mobile: Link gerado no terminal acima
echo  - Desktop: Pasta desktop\dist
echo.
pause
