import 'dotenv/config';
import mysql from 'mysql2/promise';

async function verifyAssets() {
    console.log("conectando ao banco de dados...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gm_systems_central'
    });

    try {
        console.log('\n--- VERIFICANDO CLIENTES ---');
        const [clients] = await connection.execute('SELECT id, nome FROM clients');
        console.log(JSON.stringify(clients, null, 2));

        console.log('\n--- VERIFICANDO ATIVOS (JSON) ---');
        const [rows] = await connection.execute('SELECT * FROM assets');
        console.log(JSON.stringify(rows, null, 2));

        console.log(`\nTotal de Ativos encontrados: ${rows.length}`);
    } catch (error) {
        console.error('Erro ao ler dados:', error.message);
    } finally {
        await connection.end();
    }
}

verifyAssets();
