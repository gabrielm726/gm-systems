# MANUAL TÉCNICO DE IMPLEMENTAÇÃO: G.T GESTÃO BLINDADA (V2.0 DETALHADO)

> **Versão:** 3.0 (Gratuito & Blindado)
> **Nível de Acesso:** Super Admin / Desenvolvedor
> **Objetivo:** Guia definitivo para transformar o G.T Gestão num forte digital (nível bancário) sem custos extras.

Este documento detalha **EXATAMENTE** como configurar cada camada de proteção.

---

## 🏗️ PILAR 1: ATIVAR AUDITORIA (Rastro de Pólvora)
**O que é:** Criar um "Livro Razão" no banco de dados que é *Write-Only*. Uma vez escrito, nem o Papa consegue apagar.

### 🛠️ Passo-a-Passo (Supabase):
1.  **Faça Login no Supabase:** Entre no painel do seu projeto.
2.  **Vá ao SQL Editor:** No menu lateral esquerdo, clique no ícone `SQL` (parece um terminal).
3.  **Cole o Script de Auditoria:**
    *   Pegue o conteúdo abaixo (que é o mesmo do arquivo `SETUP_SECURITY_ENHANCED.sql`):
    ```sql
    -- 1. Cria a Tabela Blindada
    CREATE TABLE audit_logs (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      action TEXT NOT NULL, -- 'LOGIN', 'DELETE_ASSET', etc
      details JSONB,
      timestamp TIMESTAMP DEFAULT now()
    );
    -- 2. Ativa o Escudo (RLS)
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    -- 3. Regra de Ouro: NGM DELETA
    CREATE POLICY "Ninguem Deleta Logs" ON audit_logs FOR DELETE USING (false);
    
    -- 4. Permissão para Gravar
    CREATE POLICY "Sistema Grava Logs" ON audit_logs FOR INSERT WITH CHECK (true);
    
    -- 5. Dar crachá pro sistema usar
    GRANT ALL ON audit_logs TO anon, authenticated, service_role;
    ```
4.  **Execute:** Clique no botão verde `RUN`.
5.  **Teste Fatal:**
    *   Vá em `Table Editor` > `audit_logs`.
    *   Insira uma linha manualmente.
    *   Tente clicar em "Delete". **O sistema VAI DAR ERRO.** Isso prova que está funcionando.

---

## 🦅 PILAR 2: O BUNKER (Supabase Storage + RLS)
**O que é:** Usar o próprio Supabase (Gratuito) para criar um cofre de arquivos. Aplicaremos uma regra de segurança similar à do banco de dados: **"Pode Entrar, Não Pode Sair"**.

### 🛠️ Passo-a-Passo (Supabase Storage):
1.  **Vá em Storage:** No menu lateral esquerdo, clique no ícone de Pasta/Arquivo.
2.  **Crie um Novo Bucket:**
    *   Clique em `New Bucket`.
    *   **Name:** `cofre_blindado` (ou o nome que preferir).
    *   **Public:** Deixe **DESMARCADO** (Privado).
    *   Clique em `Create Bucket`.
3.  **Configure a Segurança (Policies):**
    *   Vá na aba **Configuration** (dentro do Storage) ou clique em `Policies` no menu Storage.
    *   Procure pelo bucket `cofre_blindado`.
    *   Clique em `New Policy` > `For full customization`.
    *   **Nome:** `Apenas Upload (Sem Deletar)`.
    *   **Allowed Operations:** Marque **apenas** `INSERT` e `SELECT`. **NUNCA marque DELETE ou UPDATE.**
    *   **Target Roles:** `authenticated` (para o sistema) e `anon` (se necessário).
    *   Clique em `Review` e depois `Save`.
4.  **Resultado:** O sistema pode salvar cópias de segurança lá, você pode baixar para ver, mas **ninguém consegue apagar ou alterar** um arquivo depois que ele subiu. É um "Bunker Grátis".

---

## ☁️ PILAR 3: GERAÇÃO DE DOCUMENTOS "SERVER-SIDE"
**O que é:** O usuário clica em "Baixar PDF". O App **não gera** o PDF. O App **pede** o PDF pro servidor. O servidor gera, **salva uma cópia oculta**, e entrega o original.

### 🛠️ Passo-a-Passo (Supabase Edge Functions):
Isso exige uso do TERMINAL no seu computador.

1.  **Prepare o Ambiente:**
    *   Abra o terminal na pasta do projeto.
    *   Login: `npx supabase login` (vai abrir o navegador).
2.  **Crie a Função:**
    *   Comando: `npx supabase functions new gerar-documento`
3.  **A Lógica (Copie para `clound/functions/gerar-documento/index.ts`):**
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    // Use uma lib de PDF (ex: pdf-lib)

    serve(async (req) => {
      // 1. Recebe dados do usuário
      const { assetId, userId } = await req.json()

      // 2. Gera o PDF na memória do servidor
      const pdfBytes = await gerarPdfOficial(assetId)

      // 3. O PULO DO GATO: Salva cópia no Storage Seguro
      await supabase.storage.from('cofre_blindado').upload(`copia_${assetId}.pdf`, pdfBytes)

      // 4. Só agora entrega pro usuário
      return new Response(pdfBytes, { headers: { "Content-Type": "application/pdf" } })
    })
    ```
4.  **Deploy (Subir pra Nuvem):**
    *   Comando: `npx supabase functions deploy gerar-documento`
5.  **No seu App (Frontend):**
    *   Ao invés de baixar direto, chame: `supabase.functions.invoke('gerar-documento', ...)`

---

## 🛡️ PILAR 4: ESPELHAMENTO NO GOOGLE DRIVE (Automação n8n)
**O que é:** Cada "Insert" no banco dispara um robô que escreve numa planilha Google.

### 🛠️ Passo-a-Passo (n8n.io ou Zapier):
1.  **Crie o Gatilho:** Use o nodo "Webhook". Ele vai te dar uma URL (ex: `https://n8n.seu-servidor.com/webhook/uuid`).
2.  **No Supabase (Ligar o Alarme):**
    *   Vá em `Database` -> `Webhooks`.
    *   Create Webhook:
        *   Name: `Novo Ativo Criado`.
        *   Table: `public.assets`.
        *   Events: `INSERT`.
        *   URL: (A URL que o n8n te deu).
3.  **De volta no n8n:**
    *   Adicione o nodo **Google Sheets**.
    *   Operação: "Append Row".
    *   Conecte sua conta Google.
    *   Arraste os dados recebidos do Webhook (Nome, Valor) para as colunas da Planilha.
4.  **Teste:** Cadastre um bem no sistema. Conte até 3. Abra a planilha. A mágica aconteceu.

---

## 🧊 PILAR 5: COFRE LOCAL (Cold Storage)
**O que é:** O backup físico definitivo. Um script no App que baixa TUDO para o computador do dono. Garantia contra falhas de internet ou nuvem.

### 🛠️ Passo-a-Passo (Implementação):
1.  **Botão Secreto:** Em "Configurações > Segurança", adicionar botão "Gerar Backup Físico".
2.  **A Lógica (Backend):**
    *   O sistema lê todas as tabelas (`assets`, `users`, `audit_logs`).
    *   Gera arquivos `.json` ou `.csv` para cada uma.
    *   Compacta tudo num `.zip` com senha.
    *   Salva na pasta `Meus Documentos` do usuário.
3.  **Rotina:** O dono deve fazer isso 1x por semana e copiar para um HD Externo.

---

## 🚨 RESUMO TÉCNICO

| Camada | Tecnologia | Status Atual | Ação Imediata |
| :--- | :--- | :--- | :--- |
| **Banco de Dados** | Supabase Postgres | ✅ Pronto | Falta rodar Script de Auditoria. |
| **Bunker Grátis** | Supabase Storage + RLS | ❌ Pendente | Criar Bucket e Travar Deleção. |
| **Docs Seguros** | Edge Functions | ❌ Pendente | Programar a função TypeScript. |
| **Cópia Planilha** | Webhooks + n8n | ❌ Pendente | Configurar o Robô (Webhook). |
| **Cofre Local** | Script JSON/Zip | ❌ Pendente | Criar botão de download total. |

Siga esta ordem. O Pilar 1 é o mais rápido e vital. O Pilar 2 é o seguro de vida do projeto.
