
import mysql from 'mysql2/promise';

async function testConnection(password) {
    console.log(`Testando senha: '${password}' ...`);
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: password,
            database: 'gm_systems_central'
        });
        console.log(`✅ SUCESSO! A senha correta é: '${password}'`);
        await conn.end();
        process.exit(0);
    } catch (err) {
        console.log(`❌ Falha: ${err.message}`);
    }
}

async function run() {
    const passwords = ['', 'root', 'admin', '123456', '3ju4@bc8iuh987kil09@123'];

    for (const pass of passwords) {
        await testConnection(pass);
    }
    console.log("❌ Nenhuma senha funcionou.");
    process.exit(1);
}

run();
