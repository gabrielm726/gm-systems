import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function createMaster() {
    console.log('👷 Criando Usuário Master...');
    const connection = await mysql.createConnection(dbConfig);

    try {
        const passwordPlain = 'admin';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passwordPlain, salt);

        const masterId = uuidv4();
        // Use the SAME default ID used in frontend hardcoded checks if applicable
        const clientId = '11111111-1111-1111-1111-111111111111';

        // 1. Ensure Client Exists
        await connection.query(`
            INSERT IGNORE INTO clients (id, nome, documento, estado, admin_master_email, created_at)
            VALUES (?, 'GM Systems Holding', '00000000000191', 'PE', 'admin@gmsystems.com', NOW())
        `, [clientId]);

        // 2. Insert User (Fixed: Removed 'department' column which is missing in Prod)
        await connection.query(`
            INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro)
            VALUES (?, ?, 'Administrador Master', 'admin@gmsystems.com', ?, 'MASTER', 'ATIVO', 'Setup Inicial')
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'ATIVO'
        `, [masterId, clientId, hash]);

        console.log('✅ Usuário Master Criado/Atualizado com Sucesso!');
        console.log('Email: admin@gmsystems.com');
        console.log('Senha: admin');
        console.log('Client ID:', clientId);

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        connection.end();
    }
}

createMaster();
