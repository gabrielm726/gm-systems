# MANUAL DE MANUTENÇÃO E SUPORTE TÉCNICO
## G.T GESTÃO PATRIMONIAL

**Versão do Documento:** 1.1
**Data:** 15/01/2026
**Público Alvo:** Administrador do Sistema / Equipe de TI / Suporte

---

## 🚨 INTRODUÇÃO: "Deu Erro, E Agora?"

Este manual foi criado para ser o seu **colete salva-vidas**. Ele explica exatamente o que fazer quando algo der errado, garantindo que você nunca perca dados e saiba como colocar o sistema de volta no ar.

**REGRA DE OURO:** O banco de dados (Supabase) é separado do Sistema (App). Se o App der erro, travar ou sumir, **SEUS DADOS ESTÃO SEGUROS NA NUVEM**. Calma.

---

## 🛠️ CAPÍTULO 1: SOLUÇÃO DE PROBLEMAS COMUNS

### 1.1. Erro de Exportação (Word/Excel falhando)
*   **Sintoma:** Ao clicar em "Baixar", aparece erro "Failed to fetch" ou nada acontece.
*   **Causa:** Geralmente o sistema não está achando o arquivo modelo (`Planinha G.T.xlsx` ou `papel timbrado G.T.docx`).
*   **Solução Rápida:**
    1.  Verifique se os arquivos de modelo estão na pasta onde o `.exe` está instalado (geralmente `resources/public` no Windows).
    2.  O sistema possui um mecanismo de busca automática (FS/Fetch). Se persistir, contate o suporte para verificar se os arquivos `.docx/.xlsx` foram incluídos na Build.

### 1.2. Tela Branca (Sistema não carrega)
*   **Causa:** Algum dado veio corrompido do banco ou erro de código.
*   **Solução:**
    1.  Peça para o cliente pressionar `Ctrl + Shift + R` (Forçar Recarregamento).
    2.  Se persistir, siga o passo a passo de Diagnóstico Remoto no Capítulo 5.

---

## 🛡️ CAPÍTULO 2: COMO CORRIGIR BUGS SEM QUEBRAR O SISTEMA

Você contratou um programador novo ou precisa de ajuda técnica? Entregue este manual para ele.

### Protocolo de Segurança para Alterações (O "Sandbox")
Para não afetar a prefeitura que está usando o sistema agora:

1.  **NUNCA MEXA NO BANCO DE PRODUÇÃO DIRETAMENTE.**
    *   Crie um banco novo de teste ou use o "Projeto Local" do Supabase.
2.  **Use o Git (Versionamento):**
    *   Antes de qualquer mudança, rode: `git checkout -b fix-bug-nome-do-erro`.
    *   Isso cria uma "realidade paralela" (Branch). Se você estragar tudo nessa Branch, o sistema original continua intacto.
3.  **Teste a Build:**
    *   Antes de enviar a atualização para o cliente, rode `npm run build` no terminal. Se der erro ali, NÃO ENVIE.

---

## ☁️ CAPÍTULO 3: RECUPERAÇÃO DE DESASTRES (Backup)

Se o pior acontecer (ex: Hacker apagou tudo, ou Funcionário deletou sem querer).

### 3.1. Restaurando Dados (Pilar 1)
1.  Acesse `supabase.com` > Seu Projeto > Database > Backups.
2.  Escolha uma data anterior ao desastre (ex: "Ontem às 23:00").
3.  Clique em **RESTORE**.
4.  O sistema voltará exatamente como era naquele horário.

### 3.2. Acessando a Cópia de Segurança (Pilar 2)
Se o Supabase estiver fora do ar:
1.  Acesse seu **Google Drive**.
2.  Vá na pasta `G.T Backup` (se configurada).
3.  Lá estarão os relatórios gerados.

---

## 📞 CAPÍTULO 4: SUPORTE AO DESENVOLVEDOR

**Checklist para entregar ao técnico:**
- [ ] Entregar acesso ao repositório (GitHub/GitLab).
- [ ] Entregar o arquivo `.env` (chaves de acesso de desenvolvimento).
- [ ] Pedir para ele ler o arquivo `AUDITORIA_TECNICA.md`.

---

## 🕵️ CAPÍTULO 5: DIAGNÓSTICO DE ERROS DO CLIENTE (NOVO)

Quando um cliente liga dizendo "O sistema deu erro", siga este roteiro para resolver sem pânico.

### PASSO 1: A Coleta de Provas
Não tente adivinhar. Peça ao cliente:
1.  **Print da Tela:** Foto do erro exato.
2.  **O que ele estava fazendo?** "Estava cadastrando um Ativo" ou "Estava gerando relatório"?
3.  **Qual o login dele?** Para você investigar os dados dele.

### PASSO 2: O "Raio-X" do Sistema (Logs do Supabase)
Você não precisa estar no computador do cliente para ver o erro.
1.  Acesse seu painel administrativo no **Supabase**.
2.  Vá em **Monitor** ou **Logs** no menu lateral.
3.  Busque por **API Logs** e procure linhas vermelhas (Status 400 ou 500) no horário que o cliente reclamou.
    *   *Exemplo:* Se aparecer `403 Forbidden`, é erro de PERMISSÃO (RLS). O cliente está tentando acessar algo que não é dele.
    *   *Exemplo:* Se aparecer `500 Internal Server Error`, o erro é no SERVIDOR (Código ou Banco).

### PASSO 3: O "Console Secreto" (No computador do Cliente)
Se o erro for no App (tela branca, botão não clica) e não no servidor:
1.  Peça acesso remoto (AnyDesk / TeamViewer) ou guie o cliente.
2.  Com o sistema aberto, pressione **Ctrl + Shift + I** (ou F12).
3.  Uma tela técnica abrirá na lateral direita. Clique na aba **"Console"**.
4.  Procure por textos em **VERMELHO**.
    *   Tire foto/print desse texto vermelho.
    *   Envie esse texto para seu Programador ou para a "IA" (nós). Esse texto diz EXATAMENTE qual linha de código quebrou.

### Resumo da Resolução
| Tipo de Erro | Onde olhar? | Quem resolve? |
| :--- | :--- | :--- |
| "Acesso Negado" / "Não autorizado" | Supabase (Tabela Users/Profiles) | Você (Gestor) - verifique o `organization_id`. |
| Tela Branca / Botão travado | Console (Ctrl+Shift+I) | Programador (Bug de código). |
| "Failed to fetch" (Internet) | Teste a conexão | Provedor de Internet / Wi-Fi. |

---

> **Lembre-se:** 90% dos erros são "Usuário sem permissão" ou "Internet caiu". Verifique isso antes de alterar código.
