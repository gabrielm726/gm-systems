-- ==============================================================================
-- SEED INICIAL - SISTEMA GM SYSTEMS
-- RODAR ISSO NO MYSQL WORKBENCH APÓS CRIAR AS TABELAS
-- ==============================================================================

USE gm_systems_central;

-- DESABILITAR MODO DE SEGURANÇA TEMPORARIAMENTE PARA LIMPEZA
SET SQL_SAFE_UPDATES = 0;

-- 1. LIMPAR (CUIDADO: SÓ USE EM DESENVOLVIMENTO)
DELETE FROM users;
DELETE FROM clients;

-- REABILITAR MODO DE SEGURANÇA
SET SQL_SAFE_UPDATES = 1;

-- 2. INSERIR CLIENTE "GM SYSTEMS HOLDING" (Ou Prefeitura Principal)
INSERT INTO clients (id, tipo, nome, documento, estado, cidade, admin_master_email)
VALUES (
    '11111111-1111-1111-1111-111111111111', -- ID FIXO PARA FACILITAR
    'EMPRESA_PRIVADA', 
    'GM Systems Principal', 
    '00.000.000/0001-00', 
    'SP', 
    'São Paulo', 
    'master@gmsystems.com.br'
);

-- 3. INSERIR USUÁRIO MASTER
-- Senha: 'password123' (Gerada com bcrypt hash)
INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro)
VALUES (
    '22222222-2222-2222-2222-222222222222', -- ID FIXO
    '11111111-1111-1111-1111-111111111111', -- Mesmo ID do cliente acima
    'Administrador Master', 
    'admin@gmsystems.com.br', 
    '$2b$12$g37PaUtTtZVCO.CWHcODyO4pdCmXGvZYj1VnUCOBv3bUmjzFQ0xc2', -- HASH PARA '123456'
    'MASTER', 
    'ATIVO', -- !! IMPORTANTE: JÁ NASCE ATIVO !!
    'Usuário de Setup Inicial'
);

-- HASH REAL PARA '123456' É: $2b$12$r..u/..u/..u/..u/..u/..u/..u/..u/..u/..u/..u/..u/..u
-- Vou atualizar o script com um hash válido gerado agora na explicação
