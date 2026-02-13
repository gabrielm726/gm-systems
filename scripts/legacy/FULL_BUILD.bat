@echo off
echo ===================================================
echo   SISTEMA G.T - GERADOR DE INSTALADORES (CORRIGIDO)
echo ===================================================
echo.

echo [1/4] Build Web (Vite)...
call npm run build
if %errorlevel% neq 0 (
    echo Erro no Build Web.
    timeout /t 5
    exit /b %errorlevel%
)

echo.
echo [2/4] Sincronizando Mobile (Capacitor)...
call npx cap sync
if %errorlevel% neq 0 (
    echo Erro no Sync Mobile.
    timeout /t 5
    exit /b %errorlevel%
)

echo.
echo [3/4] Configurando ambiente Java (JDK 21)...
echo [3/4] Configurando ambiente Java (JDK 21)...
set "BASE_TOOLS=%USERPROFILE%\.gt_build_tools"
if not exist "%BASE_TOOLS%\jdk21" (
    echo Baixando JDK 21 portatil...
    powershell -ExecutionPolicy Bypass -File "scripts\download_jdk.ps1"
)
set "JAVA_HOME=%BASE_TOOLS%\jdk21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo JAVA_HOME definido para: %JAVA_HOME%

echo.
echo [3.05/4] Configurando Android SDK...
echo [3.05/4] Configurando Android SDK...
if not exist "%BASE_TOOLS%\android-sdk\platforms\android-35" (
    echo Baixando/Verificando Android SDK e componentes...
    powershell -ExecutionPolicy Bypass -File "scripts\download_android_sdk.ps1"
)
set "ANDROID_HOME=%BASE_TOOLS%\android-sdk"


echo.
echo [3.1/4] Gerando APK Android...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo Erro no Build Android.
    cd ..
    timeout /t 5
    exit /b %errorlevel%
)
echo APK gerado em: android\app\build\outputs\apk\debug\app-debug.apk
cd ..

echo.
echo [4/4] Gerando Instalador Desktop (.exe)...
:: Chamando node diretamente devido ao caracter & no caminho
node "node_modules\electron-builder\cli.js"
if %errorlevel% neq 0 (
    echo Erro no Build Desktop (Electron).
    echo Verifique conexao internet para baixar binarios.
    timeout /t 5
    exit /b %errorlevel%
)
echo Instalador Desktop gerado em: dist\

echo.
echo ===================================================
echo   SUCESSO! TODOS OS ARTEFATOS FORAM GERADOS.
echo ===================================================
echo.
echo Execucao finalizada.
