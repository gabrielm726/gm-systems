import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function deleteMaster() {
    console.log('🗑️ Removendo usuário admin@gmsystems.com da Nuvem...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.query('DELETE FROM users WHERE email = ?', ['admin@gmsystems.com']);
        console.log(`✅ Resultado: ${result.affectedRows} usuário(s) removido(s).`);
    } catch (error) {
        console.error('Erro ao deletar:', error.message);
    } finally {
        connection.end();
    }
}

deleteMaster();
