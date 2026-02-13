@echo off
REM ==============================================================================
REM   GERADOR DE INSTALADOR FINAL - GM SYSTEMS E GESTÃO PATRIMONIAL
REM   VERSÃO: 2.5 (FINAL)
REM   DATA: 05/02/2026
REM ==============================================================================

cd /d "%~dp0"
set "INSTALLER_NAME=Instalador_GM_Systems_Gestao_Patrimonial_v2.11.0.exe"
set "MAKENSIS=%LocalAppData%\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe"

echo.
echo ==============================================================================
echo   INICIANDO COMPILACAO DO INSTALADOR FINAL (NUVEM HABILITADA)
echo ==============================================================================
echo.

REM 1. FECHAR APLICAÇÃO
echo [1/7] Fechando processos antigos...
taskkill /F /IM "GMSystems.exe" >nul 2>&1
taskkill /F /IM "electron.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

REM 2. LIMPEZA
echo [2/7] Limpando arquivos temporarios...
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"

REM 3. DEPENDÊNCIAS
echo [3/7] Verificando dependencias (npm install)...
call npm install --legacy-peer-deps
if errorlevel 1 goto error

REM 4. BRANDING (ICONES E IMAGENS)
echo [4/7] Gerando identidade visual...
powershell -NoProfile -ExecutionPolicy Bypass -File gen_imgs.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File convert_icons.ps1

REM 5. BUILD FRONTEND (VITE)
echo [5/7] Compilando interface Web (Vite Build)...
REM Define API URL Global (Cloud)
REM Isso usa a configuracao do constants.tsx (Vercel/TiDB Proxy)
set VITE_API_URL=https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api
call npm run build
if %ERRORLEVEL% NEQ 0 goto error

REM 6. BUILD ELECTRON (UNPACKED)
echo [6/7] Empacotando executavel Electron...
call npm run pack:dir
if %ERRORLEVEL% NEQ 0 goto error

REM 7. COMPILAR INSTALADOR (NSIS)
echo [7/7] Gerando instalador .EXE (NSIS)...

REM Tenta encontrar o makensis no sistema se o caminho padrao falhar
if not exist "%MAKENSIS%" (
    echo [AVISO] Makensis padrao nao encontrado. Tentando 'makensis' do PATH...
    set "MAKENSIS=makensis"
)

"%MAKENSIS%" pro_installer.nsi
if %ERRORLEVEL% NEQ 0 goto error

REM FINALIZAÇÃO
if not exist "dist" mkdir "dist"

REM O NSIS gera o arquivo com nome fixo definido no .nsi
if exist "release\Instalador_GM_Systems_Gestao_Patrimonial.exe" (
    move /Y "release\Instalador_GM_Systems_Gestao_Patrimonial.exe" "dist\%INSTALLER_NAME%"
) else (
   echo [ERRO] O arquivo release\Instalador_GM_Systems_Gestao_Patrimonial.exe nao foi gerado.
   goto error
)

echo.
echo ==============================================================================
echo   SUCESSO! INSTALADOR GERADO EM: dist\%INSTALLER_NAME%
echo ==============================================================================
echo.
explorer dist
timeout /t 5
exit /b 0

:error
echo.
echo ==============================================================================
echo   ERRO FATAL DURANTE A COMPILACAO
echo   Verifique as mensagens acima.
echo ==============================================================================
timeout /t 10
exit /b 1
