@echo off
echo ===================================================
echo   VERIFICACAO DE INTEGRIDADE DO BANCO (TiDB)
echo ===================================================
echo.
call node check_tidb_integrity.cjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FALHA NA VERIFICACAO!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo TUDO OK COM O BANCO DE DADOS!
pause
