# PLANO MASTER DE SEGURANÇA: G.T GESTÃO BLINDADA (CONSOLIDADO)

> **Documento Unificado:** Este arquivo preserva suas anotações originais (Estratégia) e adiciona o manual técnico de execução (Tática).

---

# PARTE 1: VISÃO ESTRATÉGICA ORIGINAL (O Que Você Queria)
*(Resgatado das suas anotações originais)*

## 🏗️ PILAR 1: O COFRE DIGITAL (Banco de Dados Isolado)
**Sua Visão:** Garantir que uma prefeitura nunca veja os dados da outra.
**Status:** ✅ Implementado com Multi-tenancy e RLS (Row Level Security).

## 🦅 PILAR 2: AUDITORIA E CÓPIA SILENCIOSA
**Sua Visão:** Sempre que gerar um relatório, uma cópia oculta deve ir para um "balde" seguro, sem o usuário saber.
**Status:** ✅ Evoluído para "Supabase Storage Bunker" (Gratuito e Seguro).

## ☁️ PILAR 3: O "CORAÇÃO NA NUVEM" (Google Drive)
**Sua Visão:** Usar o Google Drive como um segundo banco de dados (acessível pelo celular) para redundância.
**Status:** ⏳ Detalhado na Parte 2 via automação (n8n/Zapier).

## 🛡️ PILAR 4: O "BUNKER" (Backup Profissional)
**Sua Visão:** Ter um backup "Cold Storage" (Amazon S3 ou similar) inviolável.
**Status:** ✅ Substituído por estratégia dupla: "Cofre Supabase" (Nuvem Grátis) + "Cofre Local" (Backup Físico), economizando custos da Amazon.

---

# PARTE 2: MANUAL TÉCNICO DE IMPLEMENTAÇÃO (Como Fizemos)
*(O passo-a-passo detalhado para executar sua visão)*

## 🏗️ PILAR 1: ATIVAR AUDITORIA (Rastro de Pólvora)
**O que é:** Criar um "Livro Razão" no banco de dados que é *Write-Only*.
**Ação Técnica:** Tabela `audit_logs` criada com políticas RLS que permitem INSERT mas bloqueiam DELETE para todos.

## 🦅 PILAR 2: O BUNKER (Supabase Storage + RLS)
**O que é:** O cofre de arquivos gratuito.
**Como Implementar:**
1.  Criar Bucket `cofre_blindado` no Supabase Storage.
2.  Aplicar Policy: `INSERT` e `SELECT` permitidos. `DELETE` e `UPDATE` bloqueados para sempre.
**Resultado:** Cumpre o objetivo de "Cópia Silenciosa" sem custo.

## ☁️ PILAR 3: GERAÇÃO DE DOCUMENTOS "SERVER-SIDE"
**O que é:** O servidor gera o PDF e salva no Bunker antes de entregar ao usuário.
**Como Implementar:** Usar Supabase Edge Functions (`gerar-documento`) para orquestrar a geração e o upload silencioso.

## 🛡️ PILAR 4: ESPELHAMENTO NO GOOGLE DRIVE
**O que é:** Integração via Webhook.
**Como Implementar:**
1.  Configurar Webhook no Supabase (`Event: INSERT`).
2.  Receber dados no n8n/Zapier.
3.  Inserir linha no Google Sheets.

## 🧊 PILAR 5: COFRE LOCAL (Cold Storage) - *NOVO*
**O que é:** Sua garantia física contra o apocalipse digital.
**Como Implementar:** Script no painel administrativo que baixa TODAS as tabelas em formato JSON/CSV compactado. Você guarda num HD externo.

---

## 🚨 RESUMO DO STATUS

| Objetivo (Sua Visão) | Solução Técnica (Execução) | Status |
| :--- | :--- | :--- |
| **Isolamento** | RLS + Multi-tenancy | ✅ **PRONTO** |
| **Imutabilidade** | Tabela `audit_logs` (No Delete) | ✅ **PRONTO** |
| **Backup Nuvem** | Supabase Storage (Bunker) | ⏳ **A FAZER AGORA** |
| **Backup Físico** | Script Local (JSON Download) | ⏳ **A PROGRAMAR** |
| **Backup Drive** | Integração Webhook | ⏳ **FUTURO** |
