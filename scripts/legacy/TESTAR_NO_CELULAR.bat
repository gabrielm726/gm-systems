@echo off
TITLE G.T. GESTAO - MODO MOBILE (WIFI)
color 0E
echo ==================================================
echo   TESTE MOBILE VIA WIFI (SEM INSTALAR)
echo ==================================================
echo.
echo 1. Garanta que seu CELULAR esta no mesmo Wi-Fi deste PC.
echo 2. Abaixo, procure por "IPv4 Address" ou "Endereço IPv4".
echo    Geralmente comeca com 192.168...
echo.
ipconfig | findstr "IPv4"
echo.
echo ==================================================
echo   COMO ACESSAR NO CELULAR:
echo.
echo   Abra o Chrome/Safari no celular e digite:
echo   http://[SEU_IP_ACIMA]:5173
echo.
echo   Exemplo: http://192.168.0.15:5173
echo ==================================================
echo.
echo Iniciando servidor... (Pressione CTRL+C para parar)
echo.
npm run dev -- --host
pause
