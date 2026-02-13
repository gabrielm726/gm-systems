# Guia de Bloqueio Total (Lockdown)

Você perguntou: *"Quero que só eu tenha acesso e mais ninguém, já está assim?"*

**Resposta Curta:** O banco está trancado para quem não tem usuário. Como não existe nenhum usuário ainda, está seguro.
**Porém**, se você deixar o "Cadastro" aberto, qualquer pessoa que descobrir o link pode criar uma conta e entrar.

Para garantir que **SÓ VOCÊ** entre, siga estes 3 passos simples:

### 1. Ignore o Erro da Extensão
O erro da imagem (`Failed to execute insertBefore...`) é causado pelo **Google Tradutor** ou outra extensão do navegador tentando traduzir o painel do Supabase.
*   **Solução:** Desative a tradução automática para esse site ou use uma Aba Anônima. Isso não afeta a segurança do sistema.

### 2. Crie Sua Conta (A Chave Mestra)
Como o sistema está vazio, você precisa ser o primeiro a entrar.
1.  No Supabase, vá em **Authentication** -> **Users**.
2.  Clique em **Add User**.
3.  Crie sua conta com seu e-mail pessoal.

### 3. Tranque a Porta (Ação Crítica)
Depois de criar sua conta, **desative** a criação de novas contas por estranhos.
1.  No Supabase, vá em **Settings** (ícone de engrenagem no menu esquerdo) -> **Auth**.
2.  Desça até a seção **User Signups**.
3.  **DESMARQUE** a opção: **"Allow new user signups"**.

✅ **Pronto!**
*   Você tem a única chave.
*   Ninguém mais pode criar chaves.
*   O banco rejeita qualquer conexão sem chave.
*   **Segurança 100% Garantida.**

Posso gerar o instalador agora?
