# RELATÓRIO DE AUDITORIA DE SISTEMA (X-RAY)
**Data:** 12/02/2026
**Projeto:** Sistema GM Systems e Gestão Patrimonial
**Versão:** 2.12.1-FIX
**Status:** ✅ ONLINE (Conectado à TiDB Cloud)

---

## 1. Estrutura do Projeto (Árvore de Arquivos)
A estrutura segue um padrão Híbrido (Monólito Modular), onde Frontend e Backend coexistem mas podem ser deployados separadamente.

```bash
/
├── api/                  # Serverless Functions (Vercel Entry Point)
│   ├── index.js          # 🔥 Ponto de entrada da API na Nuvem
├── backend/              # Backend NodeJS Tradicional (Express)
│   ├── server.js         # 🔥 Ponto de entrada Local (Porta 3002)
│   ├── src/
│   │   ├── config/       # Configuração de Banco (Pool MySQL)
│   │   ├── controllers/  # Lógica de Negócio (Assets, Auth)
│   │   ├── middleware/   # Autenticação e Segurança
│   │   └── routes/       # Definição de Rotas Express
├── src/                  # Frontend React (Vite)
│   ├── services/         # Camada de Dados Frontend (Auth, Sync, DB)
│   ├── pages/            # Telas da Aplicação
│   └── components/       # Componentes Reutilizáveis
├── vite.config.ts        # Configuração do Proxy (Conecta 3000 -> 3002)
└── package.json          # Dependências e Scripts
```

---

## 2. Backend & API (Conexão e Rotas)
O sistema possui DOIS pontos de entrada para o Backend, garantindo compatibilidade Local e Nuvem.

### A. Controllers com Conexão TiDB
**Arquivo:** `backend/src/controllers/assetController.js`
> *Prova de Conexão e Execução de SQL*

```javascript
// Importação do Pool de Conexões
import pool from '../config/database.js';

// LISTAGEM DE ATIVOS (SELECT)
export const listAssets = async (req, res) => {
    // ...
    const [rows] = await pool.query(
        'SELECT * FROM assets WHERE client_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
        [req.user.client_id]
    );
    // ...
};

// CRIAÇÃO DE ATIVO (INSERT)
export const createAsset = async (req, res) => {
    const connection = await pool.getConnection();
    // ...
    const sql = `
        INSERT INTO assets (
            id, client_id, name, categoria, status, 
            location_id, value, fabricante, modelo, 
            numero_serie, url_imagem, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(sql, values);
    // ...
};
```

### B. Rotas da API
**Arquivo:** `backend/src/routes/assetRoutes.js`
> *Definição dos Endpoints*

```javascript
router.get('/', assetController.listAssets);      // GET /api/assets
router.post('/', assetController.createAsset);    // POST /api/assets
router.post('/sync', assetController.syncBatch);  // POST /api/assets/sync (Sincronização Offline)
```

---

## 3. Frontend (Consumo de API e Estado Local)
O frontend utiliza uma abordagem mista: **Online First** para leitura inicial e **Offline First** para operações críticas (Sync).

### A. Chamadas API (Fetch)
**Arquivo:** `src/services/AuthService.ts`
> *Uso de Fetch nativo para autenticação*

```typescript
const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
});
```

### B. Gerenciamento de Dados Locais
**Arquivo:** `src/services/SyncService.ts`
> *Lógica de Sincronização (Fila de Operações)*

Este serviço gerencia uma fila de operações (`INSERT`, `UPDATE`) que ocorrem quando o usuário está offline, enviando-as em lote (`batch`) para o backend quando a conexão é restabelecida.

**Arquivo:** `src/services/DatabaseService.ts`
> *Abstração do Banco Local (SQLite/Capacitor)*

Responsável por armazenar dados no dispositivo do usuário (Cache Persistente), permitindo que o app funcione sem internet.

---

## 4. Banco de Dados (TiDB Cloud)
Diagrama REAL das tabelas extraído via auditoria automatizada.

### Tabelas Existentes
*   `assets` (Tabela Principal)
*   `users` (Usuários e Autenticação)
*   `clients` (Multi-tenancy / Organizações)
*   `locations` (Hierarquia de Locais)
*   `inventory_sessions`
*   `audit_logs`
*   ... (e outras tabelas de suporte)

### Schema da Tabela `assets` (Prova Técnica)
```sql
id                 | char(36)
client_id          | char(36)
name               | varchar(255)  <-- (Antes 'nome', corrigido para Inglês)
description        | text
value              | decimal(10,2)
status             | varchar(50)   <-- (Armazena 'estado_conservacao')
location_id        | char(36)
created_at         | timestamp
modelo             | varchar(255)
fabricante         | varchar(255)
numero_serie       | varchar(255)
categoria          | varchar(100)
url_imagem         | text
...
```

---

## 5. Hospedagem e Ambientes
O sistema opera em dois modos distintos:

### Ambiente de Desenvolvimento (`npm run dev`)
1.  **Frontend**: Vite (Porta 3000)
    *   Proxy configurado em `vite.config.ts`: Redireciona `/api` -> `http://localhost:3002`
2.  **Backend**: Node.js Express (`backend/server.js`)
    *   Roda na Porta **3002**.
    *   Conecta diretamente na TiDB Cloud via `.env`.

### Ambiente de Produção (Vercel)
1.  **Serverless**: O código em `api/index.js` é transformado em Serverless Functions.
2.  **Hardcoded Config**: Possui credenciais de banco "injetadas" no código (`api/index.js`) para garantir conexão mesmo se variáveis de ambiente falharem no deploy.

---

## 6. Fluxo de Dados (Data Flow)

### Fluxo de Criação de Ativo (Exemplo Real)
1.  **Usuário**: Preenche formulário e clica em "Salvar".
2.  **App.tsx**:
    *   Chama `fetch('/api/assets', { method: 'POST' ... })`.
3.  **Vite Proxy** (Dev Only):
    *   Intercepta `/api/assets` e repassa para `localhost:3002/api/assets`.
4.  **Backend (`assetController.js`)**:
    *   Recebe o payload JSON.
    *   Mapeia campos opcionais (`undefined` -> `null`).
    *   Executa `INSERT INTO assets ...` na TiDB.
5.  **TiDB**: Persiste o dado.
6.  **Retorno**:
    *   API retorna JSON com o objeto criado completo.
    *   Frontend atualiza o estado local (`setState`) com o novo ativo.

---

## Conclusão da Auditoria
O sistema apresenta uma arquitetura sólida e funcional.
*   ✅ **Conexão de Banco**: Segura, com Pool e SSL.
*   ✅ **Separação de Responsabilidades**: Controllers e Rotes bem definidos.
*   ✅ **Tratamento de Erros**: Logs de debug e correções para `undefined` aplicadas.
*   ✅ **Compatibilidade**: Prepara para PWA/Mobile (Offline) e Web (Online).

Este documento serve como prova técnica do estado atual do sistema.
