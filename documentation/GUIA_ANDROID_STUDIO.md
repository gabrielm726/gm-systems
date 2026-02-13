# GUIA: INSTALAÇÃO DO ANDROID STUDIO
**Objetivo:** Preparar seu computador para gerar o Aplicativo Android (.apk).

---

## 1. O QUE É E QUANTO CUSTA?
*   **O que é:** É a ferramenta oficial do Google para criar apps Android.
*   **Custo:** **100% Gratuito**.
*   **Peso:** O download tem cerca de 1GB, mas após instalado ocupa uns 4GB.

---

## 2. COMO BAIXAR E INSTALAR

### Passo 1: Download
1.  Acesse o site oficial: [developer.android.com/studio](https://developer.android.com/studio)
2.  Clique no botão verde **"Download Android Studio"**.
3.  Aceite os termos e baixe o arquivo `.exe`.

### Passo 2: Instalação (O Pulo do Gato)
Execute o instalador e vá clicando em "Next" até chegar numa tela importante de componentes.
*   **⚠️ IMPORTANTE:** Certifique-se de que a caixa **"Android Virtual Device"** esteja marcada.
*   Continue clicando em "Next" e "Install".

### Passo 3: Primeira Execução (Configuração do SDK)
Ao abrir pela primeira vez, ele vai pedir para baixar o **SDK** (que são as ferramentas de construção).
1.  Escolha a opção **"Standard"** (Padrão).
2.  Aceite as licenças (clique em "Accept" para cada licença na lista lateral, se houver).
3.  Clique em "Finish" e **espere**. Ele vai baixar muita coisa. *Vá tomar um café.*

---

## 3. GERANDO O APK (FINAL)

Depois de instalar tudo acima:

1.  Volte para a pasta do G.T Gestão.
2.  Rode o script **`GERAR_INSTALADORES.bat`**.
3.  Escolha a opção **[2] Android**.
4.  O Android Studio vai abrir já com o projeto carregado.
    *   *Aguarde a barra inferior terminar de carregar (Index/Gradle Sync).*
5.  No menu superior, vá em: `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
6.  Quando terminar, aparecerá uma notificação "APK(s) generated successfully". Clique em **"Locate"**.

**Pronto!** Esse arquivo `.apk` é o instalador do seu aplicativo. Pode mandar pelo WhatsApp para instalar no celular.
