@echo off
TITLE G.T. PATRIMONIAL - GERADOR DE INSTALADOR
color 0B
echo ==================================================
echo   GERADOR DE INSTALADOR (SETUP.EXE)
echo ==================================================
echo.
echo Este script vai criar o arquivo de instalacao
echo para voce levar para a Prefeitura.
echo.
echo [1/3] Instalando dependencias do projeto...
call npm install
echo.
echo [2/3] Compilando o codigo fonte...
call npm run build
echo.
echo [3/3] Empacotando para Windows (Criando .exe)...
call npm run dist
echo.
echo ==================================================
echo   SUCESSO!
echo ==================================================
echo.
echo O instalador foi criado na pasta "dist".
echo Vou abrir a pasta para voce agora.
echo.
explorer "dist"
pause
