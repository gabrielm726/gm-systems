@echo off
echo ==========================================
echo INICIANDO BUILD MOBILE (SEM DEPENDER DO GIT)
echo ==========================================
echo.
set EAS_NO_VCS=1
call eas build -p android --profile preview
echo.
echo Se o comando terminou, verifique o link acima.
pause
