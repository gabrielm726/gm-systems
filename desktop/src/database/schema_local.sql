-- ==============================================================================
-- SCHEMA LOCAL (SQLite) - SISTEMA GM SYSTEMS E GESTÃO PATRIMONIAL
-- VERSÃO: 2.1 (UPDATED TO MATCH CLOUD SCHEMA)
-- ==============================================================================

-- 1. CONFIGURAÇÕES
PRAGMA foreign_keys = ON;

-- 2. TABELA DE FILA DE SINCRONIZAÇÃO (SYNC QUEUE)
CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY, 
    operation TEXT NOT NULL, 
    table_name TEXT NOT NULL, 
    data_payload TEXT NOT NULL, 
    match_payload TEXT, -- Para UPDATE/DELETE
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING', 
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- 3. TABELA DE METADADOS DE CONTROLE
CREATE TABLE IF NOT EXISTS sync_control (
    table_name TEXT PRIMARY KEY,
    last_sync_timestamp DATETIME
);

-- 4. TABELAS ESPELHO (CACHE LOCAL)

-- USERS (Adicionado avatar_url e novos campos)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    role TEXT,
    status TEXT,
    avatar_url TEXT,
    phone TEXT,
    department TEXT,
    password_hash TEXT, -- Para validação offline
    token TEXT,
    client_id TEXT, -- prefeitura_id
    expires_at DATETIME
);
-- Alias para user_session se o código antigo usar
CREATE VIEW IF NOT EXISTS user_session AS SELECT id as user_id, nome, email, role, password_hash, token, client_id as prefeitura_id, expires_at, avatar_url FROM users;


-- ASSETS (Adicionado novos campos)
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    remote_id TEXT,
    codigo_patrimonio TEXT,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    estado_conservacao TEXT,
    localizacao_id TEXT,
    responsavel_id TEXT,
    valor_aquisicao REAL,
    data_aquisicao TEXT,
    
    -- Novos campos
    modelo TEXT,
    fabricante TEXT,
    numero_serie TEXT,
    url_imagem TEXT,
    url_qr_code TEXT,
    invoice_number TEXT,
    
    technical_data TEXT, -- JSON para campos extras
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    remote_id TEXT,
    nome TEXT NOT NULL,
    endereco TEXT,
    parent_id TEXT,
    type TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT,
    type TEXT,
    supplier_type TEXT,
    status TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- COSTS
CREATE TABLE IF NOT EXISTS costs (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    value REAL NOT NULL,
    date TEXT,
    type TEXT,
    supplier_id TEXT,
    asset_id TEXT,
    status TEXT,
    invoice_number TEXT,
    due_date TEXT,
    cost_center TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- INVENTORY SESSIONS
CREATE TABLE IF NOT EXISTS inventory_sessions (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT,
    responsible_id TEXT,
    total_assets_expected INTEGER,
    total_assets_scanned INTEGER,
    divergences_count INTEGER,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    entity_type TEXT,
    date TEXT,
    url TEXT,
    asset_id TEXT,
    responsible_id TEXT,
    status TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- MOVEMENTS
CREATE TABLE IF NOT EXISTS movements (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    from_location_id TEXT,
    to_location_id TEXT,
    request_date TEXT,
    responsible_id TEXT,
    to_responsible_id TEXT,
    justification TEXT,
    status TEXT,
    approval_date TEXT,
    approver_id TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- LEGAL NORMS
CREATE TABLE IF NOT EXISTS legal_norms (
    id TEXT PRIMARY KEY,
    code TEXT,
    description TEXT,
    entity_type TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

-- OFFICIAL PROCESSES
CREATE TABLE IF NOT EXISTS official_processes (
    id TEXT PRIMARY KEY,
    process_number TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);
