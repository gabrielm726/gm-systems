
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function initDB() {
    console.log("🚀 CONECTANDO AO TiDB CLOUD...");
    console.log(`📡 Host: ${process.env.DB_HOST}`);

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });
        console.log("✅ CONEXÃO BEM SUCEDIDA!");

        const schema = `
        CREATE TABLE IF NOT EXISTS clients (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            plan VARCHAR(50) DEFAULT 'FREE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            client_id CHAR(36) NOT NULL,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('MASTER', 'ADMIN', 'OPERADOR', 'AUDITOR', 'GESTOR_PATRIMONIAL') DEFAULT 'OPERADOR',
            status ENUM('PENDENTE', 'ATIVO', 'BLOQUEADO', 'REJEITADO') DEFAULT 'PENDENTE',
            motivo_cadastro TEXT,
            departamento VARCHAR(100),
            approved_by CHAR(36),
            approved_at TIMESTAMP NULL,
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS assets (
            id CHAR(36) PRIMARY KEY,
            client_id CHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            value DECIMAL(10, 2),
            status VARCHAR(50),
            location_id CHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS locations (
            id CHAR(36) PRIMARY KEY,
            client_id CHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS inventory_sessions (
            id CHAR(36) PRIMARY KEY,
            client_id CHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
            created_by CHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS inventory_items (
            id CHAR(36) PRIMARY KEY,
            session_id CHAR(36) NOT NULL,
            client_id CHAR(36) NOT NULL,
            asset_id CHAR(36),
            status VARCHAR(50),
            obs TEXT,
            scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES inventory_sessions(id),
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id CHAR(36) PRIMARY KEY,
            client_id CHAR(36) NOT NULL,
            user_id CHAR(36),
            action VARCHAR(100) NOT NULL,
            details JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        -- Inserir Cliente Padrão se não existir
        INSERT IGNORE INTO clients (id, name, plan) VALUES ('default_client_id_12345', 'Prefeitura Modelo', 'ENTERPRISE');
        
        -- Inserir ADMIN MESTRE se não existir (senha: admin123)
        INSERT IGNORE INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro)
        VALUES (
            'master_admin_id', 
            'default_client_id_12345', 
            'Administrador Master', 
            'admin@gmsystems.com.br', 
            '$2b$12$GwS1/P6.X/iP/S6.X/iP/O', 
            'MASTER', 
            'ATIVO', 
            'Seed Inicial'
        );
        `;

        // Executar queries separadas por ponto e vírgula não é suportado diretamente pelo createConnection sem multipleStatements
        // Vamos dividir manualmente
        const statements = schema.split(';').filter(s => s.trim().length > 0);

        for (const stmt of statements) {
            await conn.query(stmt);
            console.log(`🔄 Executado: ${stmt.substring(0, 50)}...`);
        }

        console.log("✅ ESTRUTURA CRIADA COM SUCESSO NO TiDB! 🎉");
        await conn.end();

    } catch (err) {
        console.error("❌ ERRO AO INICIALIZAR BANCO:", err);
    }
}

initDB();
