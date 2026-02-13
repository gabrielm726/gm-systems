
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function viewData() {
    console.log("🔍 CONECTANDO AO BANCO DE DADOS...");
    console.log("---------------------------------------------------");

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    // 1. USUÁRIOS
    const [users] = await conn.execute('SELECT id, nome, email, role, status, created_at FROM users LIMIT 10');
    console.log("\n👤 USUÁRIOS REGISTRADOS (Últimos 10):");
    console.table(users.map(u => ({
        Nome: u.nome,
        Email: u.email,
        Função: u.role,
        Status: u.status
    })));

    // 2. ATIVOS (Exemplo)
    try {
        const [assets] = await conn.execute('SELECT id, name, description, status FROM assets LIMIT 5');
        console.log("\n📦 ATIVOS CADASTRADOS (Amostra):");
        if (assets.length > 0) {
            console.table(assets);
        } else {
            console.log("   (Nenhum ativo cadastrado ainda)");
        }
    } catch (e) { console.log("   (Tabela assets ainda vazia ou inexistente)"); }

    console.log("\n✅ Tudo o que você vê aqui está salvo no MySQL.");
    console.log("   Para autorizar alguém pelo banco, você usaria:");
    console.log("   UPDATE users SET status = 'ATIVO' WHERE email = 'fulano@email.com';\n");

    await conn.end();
}

viewData().catch(console.error);
