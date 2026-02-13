# 🛠️ Guia de Manutenção e Atualização de Clientes

Este documento explica como proceder com atualizações do sistema, segurança dos dados e dúvidas sobre certificados.

## 1. Dúvidas sobre Certificados e Legalidade ⚖️

### "O que fizemos é errado ou ilegal?"
**Não, absolutamente não.**

*   **Autoria:** Você criou o software. Colocar "GM Systems" como autor e proprietário dos direitos autorais (`copyright`) no `package.json` é o procedimento correto e legal. Você é o dono da propriedade intelectual.
*   **Certificado Auto-Assinado:** Criar um certificado próprio (como fizemos) é uma prática padrão de desenvolvimento.
*   **Aviso do Windows:** A mensagem "Fornecedor Desconhecido" ou a tela azul do "SmartScreen" aparece apenas porque você não pagou uma Autoridade Certificadora (empresas como Sectigo ou DigiCert) para validar sua identidade. Isso custa cerca de R$ 2.000 a R$ 3.000 por ano.
    *   **Para o Cliente:** É seguro dizer: *"O sistema é seguro, apenas não pagamos a taxa anual da Microsoft para remover esse aviso ainda. Pode clicar em 'Mais Informações' > 'Executar mesmo assim'."*

---

## 2. A Segurança dos Dados (Nuvem vs Local) ☁️

Este é o ponto mais forte do seu sistema: **Os dados NÃO estão no computador do cliente.**

*   **Arquitetura:** O `Setup.exe` instala apenas o "Visualizador" (o App).
*   **Banco de Dados:** Todos os cadastros, ativos, usuários e logs ficam no **Supabase (Nuvem)**.

**Cenário de Desastre:**
Se o notebook do cliente queimar, for roubado ou formatado:
1.  Cliente compra computador novo.
2.  Instala o seu sistema novamente.
3.  Faz Login.
4.  **TUDO está lá.** Nada foi perdido.

---

## 3. Como Atualizar o Sistema do Cliente (Sem perder nada) 🔄

Quando você corrigir um bug ou criar uma ferramenta nova (ex: v1.1):

### O Procedimento Correto
1.  Gere o novo instalador (`BUILD_MANUAL.bat`).
2.  Envie o novo arquivo `.exe` para o cliente (WhatsApp, Google Drive, Email).
3.  Peça para o cliente **EXECUTAR o novo instalador**.

**⚠️ IMPORTANTE:**
*   **NÃO precisa desinstalar o antigo.**
*   O instalador detecta a versão anterior e substitui apenas os arquivos do sistema.
*   O login do usuário geralmente é mantido (salvo no cache local).

### Se tiver erros na atualização...
Se por algum motivo o instalador der erro ao rodar "por cima":
1.  Peça para o cliente desinstalar o app antigo (Painel de Controle).
2.  Instalar o novo.
3.  **Consequência:** Ele só terá que digitar o E-mail e Senha novamente. **NENHUM DADO DO PATRIMÔNIO SERÁ PERDIDO**, pois tudo está salvo no Supabase.

---

## Resumo para o Suporte

| Problema | Solução | Perde Dados? |
| :--- | :--- | :--- |
| Bug no sistema | Instalar nova versão "por cima" | Não |
| Computador formatado | Reinstalar sistema | Não |
| Mensagem "Vírus/Desconhecido" | Clicar "Executar mesmo assim" | - |
| Esqueceu senha | Usar "Esqueci minha senha" na tela de login | Não |
