@echo off
TITLE GM SYSTEMS - FACTORY (BUILDER)
color 0F
:MENU
cls
echo ==================================================
echo   FABRICA DE INSTALADORES (GM SYSTEMS 2.5)
echo ==================================================
echo.
echo  [1] Gerar Instalador WINDOWS (.exe)
echo  [2] Preparar Projeto ANDROID (Sync + Studio)
echo  [3] Limpar Arquivos Temporarios (Clean)
echo  [0] Sair
echo.
set /p op=Escolha uma opcao: 

if "%op%"=="1" goto WINDOWS
if "%op%"=="2" goto ANDROID
if "%op%"=="3" goto CLEAN
if "%op%"=="0" exit

:WINDOWS
cls
echo.
echo [WINDOWS] Iniciando processo de compilacao...
echo --------------------------------------------
echo 1. Limpando builds antigos...
if exist dist rmdir /s /q dist
echo.
echo 2. Compilando o Frontend (React)...
call npm run build
if %errorlevel% neq 0 goto ERROR
echo.
echo 3. Empacotando EXE (Electron)...
:: Chamando node diretamente devido ao caracter & no caminho
node "node_modules\electron-builder\cli.js"
if %errorlevel% neq 0 goto ERROR
echo.
echo SUCESSO! O instalador esta na pasta 'dist'.
pause
goto MENU

:ANDROID
cls
echo.
echo [ANDROID] Preparando ambiente Mobile...
echo -----------------------------------------
echo 1. Compilando o Frontend (Para garantir atualizacao)...
call npm run build
if %errorlevel% neq 0 goto ERROR
echo.
echo 2. Sincronizando com a pasta nativa Android...
call npx cap sync
if %errorlevel% neq 0 goto ERROR
echo.
echo 3. Abrindo Android Studio...
echo    - Ao abrir, aguarde o 'Gradle Sync'.
echo    - Cliquem em 'Build' -> 'Generate Signed Bundle / APK'.
call npx cap open android
pause
goto MENU

:CLEAN
echo.
echo Limpando pastas dist, release e cache...
if exist dist rmdir /s /q dist
if exist release rmdir /s /q release
echo Limpeza concluida.
pause
goto MENU

:ERROR
color 0C
echo.
echo [ERRO CRITICO] O processo falhou. Verifique as mensagens acima.
pause
color 0F
goto MENU
