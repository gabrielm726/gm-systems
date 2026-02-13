@echo off
chcp 65001 >nul
color 0A
title DEPLOY MANUAL VERCEL - GM SYSTEMS

echo =======================================================
echo   ENVIANDO CORRECAO PARA NUVEM (VERCEL)
echo =======================================================
echo.
echo 1. Vamos fazer Login na sua conta.
echo    Vai abrir o navegador. Aceite o Login de (Gmail).
echo.
echo Pressione ENTER para autenticar...
pause >nul

call npx vercel login

echo.
echo =======================================================
echo   LOGIN CONCLUIDO! AGORA ENVIANDO ARQUIVOS...
echo =======================================================
echo.
echo Respondendo as perguntas do Vercel:
echo.
echo [1] Set up and deploy?  -> DIGITE Y (Yes)
echo [2] Which scope?        -> ENTER (Seu Nome)
echo [3] Link to project?    -> DIGITE Y (Yes)
echo [4] Project Name?       -> ENTER (Deixe o padrao)
echo [5] Directory?          -> ENTER (Deixe ./)
echo [6] Build settings?     -> DIGITE N (No)
echo.
echo Pressione ENTER para iniciar o envio...
pause >nul

call npx vercel --prod

echo.
echo =======================================================
echo   SUCESSO! SISTEMA ATUALIZADO NA NUVEM.
echo =======================================================
echo.
echo O erro 500 deve ter sumido. Pode testar o login online.
pause
