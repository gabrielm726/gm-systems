@echo off
setlocal
echo ========================================================
echo      GERADOR DE BACKUP DO CODIGO FONTE (DEV)
echo ========================================================
echo.
echo Este script vai criar um arquivo .ZIP com TODO o codigo fonte do projeto.
echo Ele ignora pastas pesadas desnecessarias (node_modules, dist, release).
echo.
echo O arquivo sera salvo na sua AREA DE TRABALHO.
echo.

set "DT=%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%-%TIME:~3,2%"
set "DT=%DT: =0%"
set "ZIP_NAME=BACKUP_CODIGO_FONTE_GM_SYSTEMS_%DT%.zip"
set "DEST_PATH=%USERPROFILE%\Desktop\%ZIP_NAME%"

echo Gerando backup em: %DEST_PATH%
echo.
echo Aguarde... compactando arquivos...
echo.

powershell -Command "Compress-Archive -Path '.' -DestinationPath '%DEST_PATH%' -CompressionLevel Optimal -Force -Exclude 'node_modules','dist','release','venv','.git','.vscode','build','android','ios'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo             BACKUP CONCLUIDO COM SUCESSO!
    echo ========================================================
    echo.
    echo ARQUIVO: %DEST_PATH%
    echo.
    echo AGORA: Salve este arquivo no Google Drive ou Pen Drive.
    echo.
) else (
    echo.
    echo !!!!!!! ERRO AO CRIAR BACKUP !!!!!!!
    echo.
)

pause
