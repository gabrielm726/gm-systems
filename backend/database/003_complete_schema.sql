-- ==============================================================================
-- SCHEMA UPDATE 003 - COMPLETE ENTITY COVERAGE
-- Adds missing tables and columns to match frontend types.ts
-- ==============================================================================

USE gm_systems_central;

-- 1. SUPPLIERS (Fornecedores)
CREATE TABLE IF NOT EXISTS suppliers (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    cnpj VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    category VARCHAR(100),
    type ENUM('PF', 'PJ') DEFAULT 'PJ',
    supplier_type ENUM('PRODUTO', 'SERVICO', 'AMBOS'),
    status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO') DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 2. COSTS (Custos)
CREATE TABLE IF NOT EXISTS costs (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    description VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    date DATE,
    type VARCHAR(50), -- PURCHASE, MAINTENANCE, etc.
    supplier_id CHAR(36),
    asset_id CHAR(36),
    status ENUM('PAGO', 'PENDENTE', 'VENCIDO') DEFAULT 'PENDENTE',
    invoice_number VARCHAR(100),
    due_date DATE,
    cost_center VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- 3. INVENTORY SESSIONS (Inventários)
CREATE TABLE IF NOT EXISTS inventory_sessions (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255),
    type VARCHAR(50),
    start_date DATETIME,
    end_date DATETIME,
    status ENUM('ONGOING', 'COMPLETED', 'CANCELED') DEFAULT 'ONGOING',
    responsible_id CHAR(36),
    total_assets_expected INT DEFAULT 0,
    total_assets_scanned INT DEFAULT 0,
    divergences_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. DOCUMENTS (GED)
CREATE TABLE IF NOT EXISTS documents (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    entity_type VARCHAR(50), -- PUBLIC / PRIVATE
    date DATETIME,
    url TEXT,
    asset_id CHAR(36),
    responsible_id CHAR(36),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 5. MOVEMENTS (Movimentações)
CREATE TABLE IF NOT EXISTS movements (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    asset_id CHAR(36) NOT NULL,
    from_location_id CHAR(36),
    to_location_id CHAR(36),
    request_date DATETIME,
    responsible_id CHAR(36),
    to_responsible_id CHAR(36),
    justification TEXT,
    status ENUM('PENDENTE', 'APROVADO', 'REJEITADO') DEFAULT 'PENDENTE',
    approval_date DATETIME,
    approver_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 6. LEGAL NORMS
CREATE TABLE IF NOT EXISTS legal_norms (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    entity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 7. OFFICIAL PROCESSES
CREATE TABLE IF NOT EXISTS official_processes (
    id CHAR(36) PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    process_number VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 8. UPDATES TO EXISTING TABLES (Idempotent checks implied in valid SQL or ignoring errors)
-- Note: 'avatar_url' for users was added in previous step.
-- Adding missing ASSET columns
ALTER TABLE assets ADD COLUMN IF NOT EXISTS modelo VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS fabricante VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS numero_serie VARCHAR(100);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS url_qr_code VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

-- Adding missing USER columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
