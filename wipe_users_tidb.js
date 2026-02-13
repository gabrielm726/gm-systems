
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function wipeUsers() {
    console.log("🚀 CONECTANDO AO TiDB CLOUD PARA LIMPEZA...");

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: { ...JSON.parse(process.env.DB_SSL || '{}'), rejectUnauthorized: false }
        });

        console.log("✅ Conectado. Apagando todos os usuários...");

        // Apagar apenas usuários, manter Clientes e Estrutura
        await conn.execute('DELETE FROM users');

        console.log("🗑️  TODOS OS USUÁRIOS FORAM REMOVIDOS!");
        console.log("✨ O Banco de Dados está limpo e pronto para um novo 'Primeiro Cadastro'.");

        await conn.end();

    } catch (err) {
        console.error("❌ ERRO AO LIMPAR BANCO:", err);
    }
}

wipeUsers();
