
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function fixClient() {
    console.log("🚀 CONECTANDO AO TiDB CLOUD PARA CORREÇÃO DE CLIENTE...");

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: { ...JSON.parse(process.env.DB_SSL || '{}'), rejectUnauthorized: false }
        });

        console.log("✅ Conectado.");

        // Inserir o Cliente com o ID que o Frontend espera
        const frontendClientId = '11111111-1111-1111-1111-111111111111';

        console.log(`🔧 Inserindo/Atualizando cliente: ${frontendClientId}`);

        await conn.execute(`
            INSERT IGNORE INTO clients (id, name, plan) 
            VALUES (?, 'Prefeitura Padrão (Frontend)', 'ENTERPRISE')
        `, [frontendClientId]);

        console.log("✨ SUCESSO! O ID do cliente foi registado no banco.");
        console.log("👉 Agora o erro 'Cliente não encontrado' deve sumir.");

        await conn.end();

    } catch (err) {
        console.error("❌ ERRO AO CORRIGIR CLIENTE:", err);
    }
}

fixClient();
