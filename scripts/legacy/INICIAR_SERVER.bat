@echo off
cd /d "%~dp0"
echo ==========================================
echo   SISTEMA G.T - SERVIDOR BACKEND
echo ==========================================
echo.
echo Iniciando servidor na porta 8000...
echo NAO FECHE ESTA JANELA ENQUANTO USAR O SISTEMA.
echo.
cd backend
REM Usando python direto do venv para evitar erros de ativacao
".\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O servidor falhou ao iniciar. Codigo de erro: %errorlevel%
)
pause
