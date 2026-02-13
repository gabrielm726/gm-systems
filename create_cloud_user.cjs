
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root', // Using ROOT to ensure permissions
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function createMaster() {
    console.log('👷 Conectando ao TiDB Cloud...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado!');

        const passwordPlain = '123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passwordPlain, salt);

        const masterId = uuidv4();
        // Use the SAME default ID used in frontend hardcoded checks if applicable
        const clientId = '11111111-1111-1111-1111-111111111111';

        console.log('1. Upserting Client...');
        await connection.query(`
            INSERT IGNORE INTO clients (id, nome, documento, estado, admin_master_email, created_at)
            VALUES (?, 'GM Systems Holding', '00000000000191', 'PE', 'master@gmsystems.com', NOW())
        `, [clientId]);

        console.log('2. Upserting User...');
        await connection.query(`
            INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro)
            VALUES (?, ?, 'Administrador Master', 'master@gmsystems.com', ?, 'MASTER', 'ATIVO', 'Setup Cloud')
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'ATIVO'
        `, [masterId, clientId, hash]);

        console.log('✅ Usuário Master Criado/Atualizado com Sucesso!');
        console.log('Email: master@gmsystems.com');
        console.log('Senha: 123');
        console.log('Client ID:', clientId);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (connection) connection.end();
    }
}

createMaster();
