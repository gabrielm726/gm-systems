# GUIA DE OPERAÇÃO: HARDWARE DE GESTÃO (PARA O PROVEDOR)

Este guia é exclusivo para você (G.T Gestão), explicando como autorizar usuários **diretamente pelo banco de dados**, sem precisar abrir o sistema da prefeitura. Isso garante seu controle total.

---

## 1. O CENÁRIO
1.  Um funcionário da prefeitura baixa seu App.
2.  Ele se cadastra.
3.  Ele tenta entrar e recebe: **"ACESSO NEGADO: Aguardando autorização..."**
4.  Você (de qualquer lugar) acessa o Supabase e libera.

## 2. COMO AUTORIZAR (VIA SUPABASE)

Você não precisa entrar no sistema do cliente. Faça isso pelo painel de controle do banco de dados:

1.  Acesse [supabase.com](https://supabase.com) e entre no projeto `GT-PATRIMONIAL-PROD`.
2.  No menu lateral esquerdo, clique em **Table Editor** (ícone de Tabela).
3.  Selecione a tabela `profiles` (Perfis).
4.  Você verá o novo funcionário com a coluna `status` marcado como `PENDING`.

### Para APROVAR:
*   Dê dois cliques na célula `PENDING`.
*   Mude para `ACTIVE` (em maiúsculo).
*   Clique fora (ou Enter) e depois em **Save** (botão verde que aparece embaixo).
*   *Pronto: O funcionário agora consegue entrar.*

### Para BLOQUEAR (Calote ou Demissão):
*   Mude o `status` para `SUSPENDED` ou `INACTIVE`.
*   O acesso dele cai imediatamente.

---

## 3. BENEFÍCIO COMERCIAL
Isso amarra o contrato. Se a prefeitura atrasar o pagamento:
1.  Você vai no Supabase.
2.  Filtra todos os usuários daquela prefeitura.
3.  Muda todos para `SUSPENDED`.
4.  O sistema para de funcionar na hora, sem você precisar ir lá.

---

## 4. DICA DE SEGURANÇA
Monitore a tabela `audit_logs` (se configurada) ou `auth.users` periodicamente para ver se não há tentativas suspeitas de acesso.
