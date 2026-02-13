
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function listUsers() {
    console.log('--- LISTAGEM DE USUÁRIOS (TiDB Cloud) ---');

    // Config DB
    const sslConfig = process.env.DB_SSL ? { ...JSON.parse(process.env.DB_SSL), rejectUnauthorized: false } : undefined;
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: sslConfig
    });

    try {
        const [rows] = await connection.execute(`
            SELECT u.nome, u.email, u.status, u.role, c.nome as organizacao 
            FROM users u
            JOIN clients c ON u.client_id = c.id
            ORDER BY u.created_at DESC
        `);

        console.log('--- Usuários Cadastrados ---');
        rows.forEach(user => {
            console.log(`\n📂 [${user.organizacao}]`);
            console.log(`   👤 Nome: ${user.nome}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔰 Role:  ${user.role}`);
            console.log(`   🔵 Status: ${user.status}`);
        });
        console.log(`\nTotal de Usuários: ${rows.length}`);

    } catch (error) {
        console.error('❌ Erro ao listar:', error);
    } finally {
        await connection.end();
    }
}

listUsers();
