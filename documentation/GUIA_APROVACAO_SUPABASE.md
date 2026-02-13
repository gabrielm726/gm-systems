# 👑 Guia Completo do Dono: Autorizando Usuários no Supabase

Este documento é o seu manual de controle. Aqui você aprende como liberar ou bloquear pessoas que tentam entrar no seu sistema.

> **Resumo:** O sistema é "fechado". Quem se cadastra fica na porta esperando (Status: `PENDENTE`). Você precisa abrir a porta (Status: `ACTIVE`).

---

## 🚀 Como Aprovar um Novo Usuário (Passo a Passo)

Siga estes 6 passos simples sempre que alguém pedir acesso.

### 1. Acesse o "Cérebro" do Sistema (Supabase)
Clique no link abaixo para abrir o painel de controle do seu banco de dados:
🔗 **[Clique aqui para abrir o Dashboard do Supabase](https://supabase.com/dashboard/project/_/editor)**

*(Se pedir login, entre com seu e-mail e senha de administrador).*

### 2. Entre na Área de Tabelas
No menu lateral esquerdo (a barra preta no canto), procure um ícone que parece uma **Tabela** (vários quadradinhos).
*   Nome em inglês: **Table Editor**.

### 3. Encontre a Lista de Pessoas (`profiles`)
No meio da tela, vai aparecer uma lista de tabelas. Procure por uma chamada:
*   **`profiles`** (ou `public.profiles`)

> **Dica:** Se não achar, digite `profiles` na barra de pesquisa ("Pesquisar tabelas") no canto superior esquerdo.

Clique nela. Agora você está vendo a lista de todos os usuários do sistema.

### 4. Ache quem está esperando (Filtre os PENDENTE)
Olhe para a coluna chamada **`status`**.
*   Quem já usa o sistema está como `ACTIVE` (Verde/Ativo).
*   Quem pediu acesso agora está como **`PENDENTE`** (Amarelo/Esperando).

### 5. Veja quem é e por que quer entrar
Antes de aprovar, verifique a coluna **`request_reason`** (Motivo da Requisição).
*   Lá vai estar escrito algo como: *"Sou fulano da Secretaria de Obras, preciso cadastrar cadeiras."*
*   **Dica:** Se o motivo for estranho ou você não conhecer a pessoa, não aprove!

### 6. APROVAR ou RECUSAR

#### ✅ Para LIBERAR (Aprovar)
1.  Dê **dois cliques** em cima da palavra `PENDENTE`.
2.  Apague e escreva: **`ACTIVE`** (tudo maiúsculo, em inglês).
    *   *Ou selecione na lista se aparecer.*
3.  Clique no botão **Save** (ou Salvar) que vai aparecer (geralmente verde, lá embaixo ou em cima).
    *   🎉 **Pronto!** A pessoa já consegue fazer login.

#### ❌ Para BLOQUEAR (Recusar)
1.  Se não quiser liberar, você pode mudar o status para **`BLOCKED`**.
2.  Salve.
    *   ⛔ A pessoa vai tentar entrar e receberá a mensagem "Seu acesso está bloqueado".

---

## 💡 Perguntas Frequentes

**P: O usuário esqueceu a senha, mudo aqui?**
**R:** Não! Diga para ele clicar em "Esqueci minha senha" no aplicativo. Aqui você só aprova ou bloqueia.

**P: Posso criar usuário por aqui?**
**R:** Não recomendamos. O ideal é o usuário se cadastrar pelo App (ou o Admin local convidar) e você só aprovar aqui. Isso garante que os dados técnicos fiquem corretos.

**P: O que é a coluna `role`?**
**R:** É o nível de poder do usuário.
*   `admin`: Manda em tudo.
*   `operator`: Pode cadastrar e editar, mas não mexe em configurações perigosas.
*   `viewer`: Só pode olhar, não pode alterar nada.
    *   *Você pode mudar isso também dando dois cliques.*
