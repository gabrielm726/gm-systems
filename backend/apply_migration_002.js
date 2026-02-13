import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log("🔌 Conectando ao MySQL...");
        const connection = await pool.getConnection();
        console.log("✅ Conexão estabelecida.");

        const sqlPath = path.join(__dirname, 'database', '002_create_resources.sql');
        console.log(`📂 Lendo arquivo de migração: ${sqlPath}`);

        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split commands by semicolon (simple splitter, might need robustness for complex procedures but ok for CREATE TABLE)
        // However, mysql2 supports multiple statements if configured, but let's try running the whole block if possible, 
        // or split manually. The file has simple CREATE TABLEs.

        // Actually, mysql2 pool.query might not support multiple statements unless enabled.
        // Let's enable it temporarily or split.

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`⚙️ Executando ${statements.length} instruções SQL...`);

        for (const statement of statements) {
            if (statement.toUpperCase().startsWith('USE')) continue; // Skip USE, already connected

            try {
                await connection.query(statement);
            } catch (err) {
                if (err.errno === 1061 || err.errno === 1050) {
                    console.warn(`⚠️ Aviso: ${err.sqlMessage} (Ignorado)`);
                } else {
                    throw err;
                }
            }
        }

        console.log("✅ Migração 002 aplicada com SUCESSO!");
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error("❌ Erro fatal na migração:", error);
        process.exit(1);
    }
}

runMigration();
