import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function listUsers() {
    console.log('🔍 Listando Usuários no TiDB...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.query('SELECT id, nome, email, client_id, status FROM users');
        console.table(rows);
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        connection.end();
    }
}

listUsers();
