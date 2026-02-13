# GUIA DE USO E INSTALAÇÃO - SISTEMA G.T

Este guia explica como instalar o sistema no computador, no celular e como usar "de longe" (remoto).

## 1. Instalação no Computador (Principal)
1. Após finalizar o comando de Build, vá na pasta `dist` que apareceu na Área de Trabalho.
2. Execute o arquivo instalador `.exe` (ex: `Sistema GT Setup 1.0.0.exe`).
3. O sistema será instalado e abrirá automaticamente.

## 2. Instalação no Celular (Android)
1. Vá na pasta `android\app\build\outputs\apk\debug`.
2. Copie o arquivo `app-debug.apk` para seu celular (via cabo USB, WhatsApp ou Drive).
3. No celular, clique para instalar o APK. (Pode ser necessário autorizar "Fontes Desconhecidas").

## 3. Iniciando o "Cérebro" do Sistema (Servidor)
Para que o sistema funcione (tanto no PC quanto no celular), o servidor precisa estar ligado no computador principal.

1. Na Área de Trabalho, dê dois cliques em `INICIAR_SERVER.bat`.
2. Uma janela preta abrirá. **NÃO FECHE ELA**. Ela é o servidor.
3. Se aparecer um aviso do Firewall do Windows, clique em **"Permitir Acesso"** (marque as duas caixas, Privada e Pública, se possível).

## 4. Usando o Sistema no Celular (Rede WiFi Local)
Se você estiver no **mesmo WiFi** do computador:
1. Descubra o IP do seu computador:
   - Abra o `INICIAR_SERVER.bat` e veja se ele mostra algo como `Running on http://0.0.0.0:8000`.
   - Abra o Menu Iniciar, digite `cmd`, abra, digite `ipconfig` e pegue o "Endereço IPv4" (ex: `192.168.1.5`).
2. No celular, se o App pedir o endereço do servidor, digite: `http://192.168.1.5:8000` (troque o número pelo seu IP).

## 5. Usando "De Longe" (Rede Externa / 4G)
Se você quer usar do 4G ou de outro lugar longe:
Você precisa de uma ferramenta para "expor" seu computador para a internet. Recomendamos o **Ngrok** ou **Tailscale**.

### Opção A: Usando Ngrok (Mais Fácil para teste rápido)
1. Baixe o Ngrok (ngrok.com).
2. Abra o Ngrok e digite: `ngrok http 8000`
3. Ele vai gerar um link estranho (ex: `https://a1b2-200-100.ngrok-free.app`).
4. No seu Celular, use ESSE link como endereço do servidor.

### Opção B: IP Público (Avançado)
Se você tem internet com IP Fixo ou configurou seu roteador (Port Forwarding da porta 8000), use seu IP Externo.

---
**IMPORTANTE:** Mantenha o arquivo `INICIAR_SERVER.bat` rodando sempre que quiser usar o sistema.
