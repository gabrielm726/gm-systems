# PLANO MASTER DE SEGURANÇA E REDUNDÂNCIA (G.T GESTÃO)

Este documento é o **mapa definitivo** da sua infraestrutura de segurança. Ele une a tecnologia de ponta (Multi-tenancy) com estratégias de backup triplo (Supabase + Drive + Bunker), garantindo que **você (Dono)** tenha controle absoluto e cópias de tudo.

---

## 🏗️ PILAR 1: O COFRE DIGITAL (Banco de Dados Isolado)

Já implementamos no script `SETUP_SUPABASE_V2.sql` a tecnologia de **Multi-tenancy**.

1.  **O que é:** Um único sistema gerencia várias prefeituras, mas **uma prefeitura nunca vê os dados da outra**.
2.  **Como funciona:**
    *   O banco usa o campo `organization_id` como uma "assinatura digital".
    *   A **Polícia do Banco (Row Level Security)** bloqueia qualquer tentativa de um usuário acessar dados que não tenham a assinatura da equipe dele.
3.  **Sua Visão:** Como "Super Admin", você tem a **Chave Mestra**. Você vê tudo, de todos. Eles só veem o quintal deles.

---

## 🦅 PILAR 2: AUDITORIA E CÓPIA SILENCIOSA (Word/Excel)

Você quer garantir que, além dos dados no banco, existam **arquivos físicos** (Word/Excel) gerados e enviados para você.

### A Estratégia: "Espelhamento de Exportação"
Para automatizar isso sem depender do usuário clicar em "Enviar":

1.  **Como funciona:**
    *   Sempre que o usuário clica em "Gerar Relatório Oficial" no sistema, o App gera **dois** arquivos.
    *   Um arquivo baixa para o computador dele (o que ele vê).
    *   O segundo arquivo é **enviado silenciosamente** para um "Balde de Armazenamento" (Storage Bucket) no seu Supabase.
2.  **Implementação:**
    *   Criamos uma pasta no Supabase Storage chamada `relatorios-auditoria`.
    *   Configuramos o código para: `uploadToSupabase(file)` ao mesmo tempo que faz `downloadToUser(file)`.

---

## ☁️ PILAR 3: O "CORAÇÃO NA NUVEM" (Google Drive - Banco nº 2)

Você quer usar o Google Drive como um **segundo banco de dados** e repositório de garantia. Isso é excelente para acessibilidade.

### Como Implementar (Automação "Low-Code"):
Não precisamos mexer no código do App. Usaremos uma ferramenta de integração (como **n8n** ou **Zapier**) conectada ao Supabase.

1.  **O Fluxo (A Mágica):**
    *   **Gatilho:** "Novo Ativo Criado" no Supabase.
    *   **Ação:** O robô do n8n/Zapier cria automaticamente uma **linha no Google Sheets** (Planilha Mestra) no seu Drive.
    *   **Ação 2:** Se houver foto/PDF, o robô salva o arquivo numa pasta "BACKUP_PREFEITURA_X" no seu Google Drive.
2.  **Resultado:**
    *   Você abre seu Google Drive no celular e vê planilhas sendo preenchidas em tempo real.
    *   Se o sistema inteiro explodir, seus dados estão salvos em planilhas simples do Google.

---

## 🛡️ PILAR 4: O "BUNKER" (Banco Profissional nº 3)

Para ter a redundância nível "Enterprise" (+1 Banco de Garantia), recomendamos o padrão da indústria: **Amazon S3 (Cold Storage)** ou **Backup Hexagonal**.

### A Solução Profissional: "Supabase PITR + S3"
1.  **Supabase Point-in-Time Recovery (PITR):**
    *   O próprio Supabase oferece um serviço (pago) que tira uma "foto" do banco de dados a cada segundo.
    *   Se um funcionário mal intencionado apagar tudo às 14:00, você pode "voltar o tempo" para as 13:59.
2.  **O Bunker Externo (Script de Dump):**
    *   Criamos um script automático (que roda no servidor) que toda madrugada faz:
        1.  Baixa todo o banco de dados (arquivo `.sql` gigante).
        2.  Criptografa esse arquivo com senha.
        3.  Envia para um servidor **Amazon S3 Glacier** (Custo baixíssimo, segurança máxima).
    *   Isso garante que, mesmo que o Supabase suma do mapa, você tem o arquivo bruto do banco seguro num cofre da Amazon.

---

## 🗺️ RESUMO E PRÓXIMOS PASSOS

| Camada | Tecnologia | Função | Status |
| :--- | :--- | :--- | :--- |
| **1. Operacional** | **Supabase (RLS)** | Onde o App roda. Rápido e Seguro. | ✅ **PRONTO** (Script V2) |
| **2. Documental** | **Google Drive** | Cópia legível (Planilhas/Docs) para você ver no celular. | ⏳ **A CONFIGURAR** (Zapier/n8n) |
| **3. Profissional** | **Amazon S3 / PITR** | O Último Recurso. Criptografado e inviolável. | ⏳ **A CONFIGURAR** (Script Server) |

### Como proceder?
1.  **Imediato:** Use o sistema isolado (Multi-tenant) que já criamos. Ele já é 100x mais seguro que planilhas locais.
2.  **Curto Prazo:** Contrate o **n8n** (ferramenta de automação) para ligar seu Supabase ao Google Drive.
3.  **Longo Prazo:** Ative o Backup PITR no painel do Supabase quando tiver contratos pagantes.
