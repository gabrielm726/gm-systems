import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function checkSchema() {
    console.log('🔍 Verificando Schema da Tabela ASSETS na Nuvem...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.query('DESCRIBE assets');
        console.table(rows);
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        connection.end();
    }
}

checkSchema();
