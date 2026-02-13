-- MIGRATION: 002_create_resources.sql
-- CRIAÇÃO DAS TABELAS DE RECURSOS (ATIVOS E UNIDADES) COMPATÍVEIS COM SQLITE LOCAL

USE gm_systems_central;

-- 1. TABELA DE UNIDADES (LOCATIONS)
CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) PRIMARY KEY, -- UUID v4
    client_id CHAR(36) NOT NULL,
    remote_id CHAR(36), -- Para compatibilidade futura
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    parent_id CHAR(36), -- Para hierarquia (Ex: Prédio A -> Andar 1 -> Sala 101)
    is_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 2. TABELA DE ATIVOS (ASSETS)
CREATE TABLE IF NOT EXISTS assets (
    id CHAR(36) PRIMARY KEY, -- UUID v4
    client_id CHAR(36) NOT NULL,
    remote_id CHAR(36),
    codigo_patrimonio VARCHAR(100),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    estado_conservacao VARCHAR(50) DEFAULT 'GOOD', -- GOOD, FAIR, POOR, BAD, DISPOSED
    localizacao_id CHAR(36),
    responsavel_id CHAR(36),
    valor_aquisicao DECIMAL(15, 2),
    data_aquisicao DATE,
    imagem_url TEXT,
    
    -- Campos de controle de sincronização
    is_deleted BOOLEAN DEFAULT 0,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (localizacao_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (responsavel_id) REFERENCES users(id) ON DELETE SET NULL
);

-- INDEXES PARA PERFORMANCE
CREATE INDEX idx_assets_client ON assets(client_id);
CREATE INDEX idx_assets_code ON assets(codigo_patrimonio);
CREATE INDEX idx_locations_client ON locations(client_id);
