@echo off
cd /d "%~dp0"
TITLE GM SYSTEMS - BUILD FINAL
color 0F
echo ==================================================
echo   GM SYSTEMS E GESTAO PATRIMONIAL - BUILD FINAL
echo ==================================================
echo.
echo [ATENCAO] RECOMENDADO: FECHE O ANDROID STUDIO E NAVEGADORES
:: Configurar Cache para o TEMP (Evita erros de permissao e symlink no Desktop)
set CSC_IDENTITY_AUTO_DISCOVERY=false
set ELECTRON_BUILDER_CACHE=%TEMP%\electron-builder-cache-gt

:: Limpar cache antigo se existir no TEMP (Garanta download limpo)
if exist "%ELECTRON_BUILDER_CACHE%" rmdir /s /q "%ELECTRON_BUILDER_CACHE%"
mkdir "%ELECTRON_BUILDER_CACHE%"
echo.
echo Seu computador tem 8GB de RAM. A compilacao consome muito.
echo Fechar outros programas evita erros de "Out of Memory".
echo.
pause
echo.
echo 1. Limpando versoes antigas e cache...
if exist dist rmdir /s /q dist
if exist .cache rmdir /s /q .cache
echo.
echo 2. Compilando Frontend (Modo Otimizado)...
:: Usa o script 'build' do package.json que ja tem limite de memoria
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha na compilacao do site.
    echo Tente fechar mais programas e rodar de novo.
    pause
    exit /b %errorlevel%
)
echo.
echo 3. Gerando Executavel Windows (Com Assinatura)...
:: Chamando node diretamente para evitar erro no caminho com espacos e &
node "node_modules\electron-builder\cli.js"
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao criar o instalador .EXE.
    pause
    exit /b %errorlevel%
)
echo.
color 0A
echo ==================================================
echo   SUCESSO! BUILD CONCLUIDA.
echo ==================================================
echo.
echo 1. O instalador Windows (.exe) esta na pasta 'dist'.
echo.
echo 2. Para o ANDROID:
echo    - Pode abrir o Android Studio agora.
echo    - A pasta 'dist' ja esta atualizada com o novo nome.
echo    - Rode 'npx cap sync' se quiser garantir.
echo    - Gere o APK la no Android Studio.
echo.
pause
