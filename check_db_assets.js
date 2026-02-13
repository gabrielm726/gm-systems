import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function listAssets() {
    console.log('🔍 Buscando os 5 últimos ativos salvos na Nuvem...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.query(`
            SELECT id, name, value, status, created_at 
            FROM assets 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        if (rows.length === 0) {
            console.log('📭 Nenhum ativo encontrado no banco.');
        } else {
            console.table(rows.map(a => ({ id: a.id, name: a.name, value: a.value, status: a.status, created_at: a.created_at })));

            const found = rows.find(r => r.name === 'Ativo Teste Full Mapping');
            if (found) {
                console.log("✅ SUCESSO! Ativo 'Ativo Teste Full Mapping' ENCONTRADO!");
                process.exit(0);
            } else {
                console.error("❌ FALHA! Ativo 'Ativo Teste Full Mapping' NÃO ENCONTRADO.");
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        connection.end();
    }
}

listAssets();
