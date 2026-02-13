# DOSSIÊ TÉCNICO E DE SEGURANÇA DA INFORMAÇÃO
**Sistema:** G.T Gestão Patrimonial
**Cliente Final:** [Nome da Prefeitura/Entidade]
**Data:** Janeiro/2026

---

## 1. Arquitetura do Sistema
O **G.T Gestão Patrimonial** foi desenvolvido utilizando uma arquitetura moderna, escalável e segura, baseada em nuvem híbrida (Cloud + Local Cache).

*   **Front-end (Interface):** React.js + Electron (Tecnologia usada por Discord e WhatsApp).
*   **Back-end (Servidor):** Supabase (PostgreSQL Enterprise).
*   **Infraestrutura:** Google Cloud Platform (GCP) e Amazon Web Services (AWS).

## 2. Protocolos de Segurança (Nível Bancário)
Garantimos a integridade e o sigilo dos dados públicos conformes com a **LGPD (Lei Geral de Proteção de Dados)**.

### 2.1. Criptografia e Isolamento
*   **Dados em Repouso:** Todos os bancos de dados são criptografados (AES-256).
*   **Dados em Trânsito:** Toda comunicação trafega via SSL/TLS (HTTPS Cadeado Seguro).
*   **Isolamento Multi-tenant (RLS):** Utilizamos *Row Level Security* a nível de banco de dados. É matematicamente impossível um usuário de uma Secretaria acessar dados de outra sem autorização explícita de "Super Admin".

### 2.2. Auditoria Imutável
O sistema registra todas as operações críticas (Criação, Edição, Deleção).
*   **Logs de Auditoria:** Gravados em tabelas *Write-Only* (apenas escrita), impedindo que usuários mal-intencionados apaguem seus rastros.
*   **Rastreabilidade:** Cada ação grava o ID do Usuário, IP de Origem e Data/Hora exata.

## 3. Política de Backup e Redundância
Para garantir que o patrimônio público nunca seja perdido, adotamos a estratégia de **Backup Triplo**:

1.  **Nível 1 (Tempo Real):** Replicação instantânea no banco de dados principal.
2.  **Nível 2 (Recovery):** Point-in-Time Recovery (PITR) permitindo voltar o sistema para qualquer segundo dos últimos 7 dias.
3.  **Nível 3 (Cold Storage):** Cópia diária enviada para armazenamento frio (Amazon S3 Glacier) com proteção contra Ransomware (Object Lock).

## 4. Requisitos de Instalação
O software foi projetado para rodar em hardware modesto, preservando recursos da prefeitura.

*   **Sistema Operacional:** Windows 10 ou superior.
*   **Processador:** Intel Core i3 ou superior (recente).
*   **Memória RAM:** 4GB (Recomendado 8GB).
*   **Rede:** Conexão estável com a internet (para sincronização).
    *   *Nota: O sistema possui "Modo Offline" para consultas e operações básicas.*

---
**Responsável Técnico:**
Equipe de Desenvolvimento G.T Softwares
*Assinatura Digital*
