@echo off
TITLE FORCE KILL - GM SYSTEMS
color 0E
echo ========================================================
echo   VARRENDO PROCESSOS (MODO AVANCADO)...
echo ========================================================
echo.

powershell -ExecutionPolicy Bypass -File "kill_process.ps1"

echo.
echo Processo concluido. Verifique se nao ha mais janelas abertas.
echo.
pause
