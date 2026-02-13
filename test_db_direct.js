import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function testDirectInsert() {
    console.log('⚡ Testando INSERT direto no TiDB (Sem Vercel)...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(`
            INSERT INTO assets (id, client_id, name, status, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, ['direct-test-' + Date.now(), '11111111-1111-1111-1111-111111111111', 'Ativo Teste Direto', 'NOVO']);

        console.log('✅ INSERT Sucesso. Rows affected:', result.affectedRows);

        const [rows] = await connection.query('SELECT * FROM assets ORDER BY created_at DESC LIMIT 1');
        console.table(rows);

    } catch (error) {
        console.error('❌ Erro no INSERT:', error.message);
    } finally {
        connection.end();
    }
}

testDirectInsert();
