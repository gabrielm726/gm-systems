# Guia de Segurança e Backup Manual - Supabase (Plano Gratuito)

Este guia foi criado para garantir que você tenha total controle sobre a segurança e os dados do seu sistema, mesmo utilizando o plano gratuito.

---

## 🔒 1. Backup Manual Simplificado (O Jeito Mais Fácil)

Como o plano gratuito não tem "voltar no tempo" (PITR) automático, você deve baixar uma cópia do seu banco de dados regularmente (ex: toda sexta-feira).

### Passo a Passo Visual:

1.  Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2.  No menu lateral esquerdo, clique em **Database** (ícone do Banco de Dados).
3.  No menu interno que abrir, clique em **Backups**.
4.  Você não poderá usar o "Point in Time", então clique na aba **Database Exports** (ou "Exportações").
5.  Clique no botão **Export Data** (Exportar Dados).
    *   *Opção recomendada:* Marque "Include data" (Incluir dados) e "Include definitions" (Incluir definições).
6.  O download de um arquivo `.sql` começará (ex: `backup_2026_01_26.sql`).

---

## ☁️ 2. Plano de Segurança Híbrido (Local + Google Drive)

Para garantir redundância contra falha de disco ou ransomwares, siga este protocolo de armazenamento.

### A. Preparação Local (Seu Computador)
1.  Crie uma pasta segura no seu computador (Não use a Área de Trabalho).
    *   Sugestão: `C:\Meus Backups\GMS_Sistema`
2.  Dentro dela, crie pastas por ano ou mês se preferir organização.
3.  **Encripte a pasta (Opcional mas Recomendado):**
    *   Clique com botão direito na pasta > Propriedades > Avançados > "Criptografar o conteúdo para proteger os dados".

### B. Rotina de Backup (O "Ritual")
Sempre que baixar o arquivo `.sql` do Supabase:

1.  **Renomeie o arquivo** colocando a data de hoje.
    *   Exemplo: `GMS_Backup_Completo_2026-05-20.sql`
2.  **Mova** para sua pasta local segura (`C:\Meus Backups\GMS_Sistema`).
3.  **Suba para o Google Drive:**
    *   Abra o [Google Drive](https://drive.google.com).
    *   Crie uma pasta chamada `🔒 BACKUPS SISTEMA GMS`.
    *   Arraste o arquivo `.sql` para lá.
    *   *Dica de Ouro:* Se tiver o Google Drive para Desktop instalado, apenas salve o arquivo na pasta do Drive no seu PC e ele sincroniza sozinho.

### C. Recuperação de Desastre
Se seu computador queimar, você tem o Google Drive.
Se o Google Drive for invadido, você tem o Supabase.
Se o Supabase cair, você tem o arquivo Local e no Drive para restaurar em qualquer outro lugar.

---

## 🛡️ 3. Ativando Autenticação de Dois Fatores (2FA)

Você mencionou corretamente que o Supabase oferece segurança de nível Enterprise. Ativar o 2FA garante que, mesmo que roubem sua senha, não consigam apagar seu banco de dados.

### Como Ativar:
1.  No Supabase Dashboard, clique na sua **Foto de Perfil** (canto inferior esquerdo ou superior direito).
2.  Vá em **Account Settings** (Configurações da Conta).
3.  Clique em **Security** (Segurança).
4.  Em **Two-Factor Authentication**, clique em "Enable".
5.  Use um aplicativo como **Google Authenticator** ou **Microsoft Authenticator** no seu celular para escanear o QR Code.

> **Dica:** Isso protege o PAINEL do Supabase (onde você apaga o banco). O login do seu sistema "GM Systems" continua normal para os usuários do dia a dia.

---

## 🚦 4. Monitoramento de Segurança (Logs)

O plano gratuito guarda logs por 1 dia. Se houver algum incidente, você precisa agir rápido para ver o que houve.

*   Vá em **Project Settings** > **Logs** > **Auth**.
*   Aqui você vê quem entrou, quem falhou a senha e IPs suspeitos.
*   *Recomendação:* Se notar algo estranho, vá direto em **Authentication** > **Users** e bloqueie o usuário suspeito (Três pontinhos > Ban user).

---

## ⚡ Resumo da Rotina de Segurança

| **Sempre** | Manter 2FA Ativo | Configurações da Conta Supabase |

---

## 🚨 5. RECUPERAÇÃO DE DESASTRE (Hack, Roubo ou Formatação)

Como estamos usando a **Arquitetura Híbrida (Standalone)**, seus dados estão **MUITSIMOS MAIS SEGUROS** do que se estivessem apenas no seu computador.

### Cenário: "Meu computador foi roubado/queimou/pegou vírus."
**O que acontece com os dados?**
*   **NADA.** Absolutamente nada. Seus dados estão no **TiDB Cloud (Nuvem)**, protegidos por senha e criptografia. O ladrão ou o vírus só tem acesso ao "aplicativo" (a casca), mas não consegue apagar o banco de dados na nuvem sem as credenciais mestre (que não ficam expostas facilmente).

### Como Recuperar (O "Botão de Pânico"):
1.  Compre/Pegue um **computador novo**.
2.  Instale o **Instalador do Sistema** (`.exe`) que você gerou.
3.  Faça login com seu usuário e senha.
4.  **PRONTO.** Todos os seus dados, cadastros e relatórios aparecerão magicamente, exatamente como estavam antes.

**Resumo:** O aplicativo no computador é descartável. O Banco de Dados na Nuvem é eterno.

---

## 💾 6. BACKUP DO CÓDIGO FONTE (Para o Programador/Dono)

Você perguntou: *"E se eu perder o código, como conserto erros futuros?"*
Para isso, você precisa baixar o código fonte (a "receita" do sistema).

### Como fazer (1 Clique):
1.  Na pasta do projeto, dê dois cliques no arquivo: `BACKUP_CODIGO_FONTE.bat`.
2.  Ele vai criar um arquivo **.ZIP** na sua Área de Trabalho (ex: `BACKUP_CODIGO_FONTE_GM_SYSTEMS_2026-02-08.zip`).
3.  **SALVE ESSE ARQUIVO NO GOOGLE DRIVE.**

### O que tem nesse ZIP?
*   Todo o código React (Frontend).
*   Todo o código Node.js (Backend).
*   Scripts de banco de dados e instaladores.
*   Chaves de configuração (exceto as que você deve configurar de novo).

> **IMPORTANTE:** Faça isso toda vez que terminarmos uma grande atualização. Assim, se seu PC explodir, basta baixar o ZIP em um PC novo, rodar `npm install` e continuar programando.
