-- ==============================================================================
-- SCHEMA CENTRAL (MySQL) - SISTEMA GM SYSTEMS E GESTÃO PATRIMONIAL
-- VERSÃO: 2.1 (NO SUPABASE + CLIENT UPDATE)
-- ARQUITETURA: MULTI-INQUILINO COM ISOLAMENTO LÓGICO (client_id)
-- ==============================================================================

-- 0. CRIAR E SELECIONAR BANCO DE DADOS
CREATE DATABASE IF NOT EXISTS gm_systems_central;
USE gm_systems_central;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABELA DE CLIENTES (PREFEITURAS OU EMPRESAS)
-- Generalizado para suportar qualquer tipo de organização.
CREATE TABLE IF NOT EXISTS clients (
    id CHAR(36) NOT NULL PRIMARY KEY, -- UUID
    tipo ENUM('PREFEITURA', 'EMPRESA_PRIVADA') DEFAULT 'PREFEITURA',
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL, -- CPF ou CNPJ
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100),
    admin_master_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. TABELA DE USUÁRIOS
-- Regra de Ouro: status padrao = 'PENDENTE'. Só loga se 'ATIVO'.
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY, -- UUID
    client_id CHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Bcrypt
    role ENUM('MASTER', 'ADMIN', 'OPERADOR', 'CAMPO', 'VIEWER') DEFAULT 'OPERADOR',
    status ENUM('PENDENTE', 'ATIVO', 'BLOQUEADO', 'REJEITADO') DEFAULT 'PENDENTE',
    motivo_cadastro TEXT NOT NULL, -- Obrigatório explicar por que quer acesso
    approved_by CHAR(36), -- ID do Master que aprovou (NULL se for o 1o Master)
    approved_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_email_client (email, client_id) -- Email pode repetir em clientes diferentes
);

-- 3. AUDITORIA (AUDIT LOGS)
-- Segurança: Saber quem fez o que, quando e onde.
CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) NOT NULL PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'LOGIN', 'CREATE_ASSET', 'APPROVE_USER', 'SYNC'
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. ATIVOS (ASSETS)
-- Tabela principal de patrimônio
CREATE TABLE IF NOT EXISTS assets (
    id CHAR(36) NOT NULL PRIMARY KEY,
    client_id CHAR(36) NOT NULL, -- OBRIGATÓRIO EM TUDO
    codigo_patrimonio VARCHAR(50),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    estado_conservacao ENUM('NOVO', 'BOM', 'REGULAR', 'RUIM', 'INSERVIVEL') DEFAULT 'BOM',
    
    -- Localização
    localizacao_id CHAR(36), -- FK para tabela de locais
    responsavel_id CHAR(36), -- FK para user (responsável atual)
    
    -- Valores
    valor_aquisicao DECIMAL(15, 2),
    data_aquisicao DATE,
    nota_fiscal VARCHAR(100),
    
    version_id INT DEFAULT 1, -- Para controle de sincronização (concorrência otimista)
    last_modified_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete para sincronização segura
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES users(id),
    
    INDEX idx_assets_client (client_id),
    INDEX idx_assets_updated (updated_at) -- Para sync delta
);


-- 5. LOCAIS (LOCATIONS)
CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    parent_id CHAR(36), -- Hierarquia de locais
    
    version_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES locations(id)
);

ALTER TABLE assets ADD CONSTRAINT fk_assets_location FOREIGN KEY (localizacao_id) REFERENCES locations(id);

SET FOREIGN_KEY_CHECKS = 1;
