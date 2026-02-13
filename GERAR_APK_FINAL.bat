@echo off
chcp 65001 > nul
cls
echo =======================================================
echo   GERAR APK ANDROID (GLOBAL + OFFLINE)
echo =======================================================
echo.
echo 1. Limpando builds anteriores...
cd android
call gradlew clean

echo.
echo 2. Compilando APK (Debug/Global)...
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo 3. Copiando para pasta release...
cd ..
if not exist "release" mkdir "release"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "release\GM_Systems_Android_v2.10.0.apk"
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao copiar o APK. Verifique se o build foi bem sucedido.
    goto error
)

echo.
echo =======================================================
echo   SUCESSO! APK GERADO EM: release\GM_Systems_Android_v2.10.0.apk
echo =======================================================
echo.
pause
exit /b 0

:error
echo.
echo =======================================================
echo   ERRO FATAL DURANTE A COMPILACAO DO APK
echo =======================================================
pause
exit /b 1
