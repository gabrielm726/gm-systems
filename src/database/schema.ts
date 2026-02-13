export const LOCAL_SCHEMA = `
-- SCHEMA LOCAL (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    data_payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_control (
    table_name TEXT PRIMARY KEY,
    last_sync_timestamp DATETIME
);

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
    modelo TEXT,
    fabricante TEXT,
    numero_serie TEXT,
    url_imagem TEXT,
    technical_data TEXT,
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    remote_id TEXT,
    nome TEXT NOT NULL,
    endereco TEXT,
    parent_id TEXT,
    is_dirty BOOLEAN DEFAULT 0,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_session (
    user_id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    role TEXT,
    token TEXT,
    prefeitura_id TEXT,
    expires_at DATETIME
);
`;
