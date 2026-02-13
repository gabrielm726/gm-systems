@echo off
echo ===================================================
echo   DEPLOY E VERIFICACAO DA NUVEM (VERCEL)
echo ===================================================
echo.
call node deploy_and_verify_vercel.cjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FALHA NO DEPLOY OU VERIFICACAO!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo SUCESSO! O SISTEMA NA NUVEM ESTA ATUALIZADO.
pause
