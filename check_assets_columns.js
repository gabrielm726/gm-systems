import 'dotenv/config';
import pool from './backend/src/config/database.js';

async function checkColumns() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM assets");
        console.log("COLUNAS_START");
        rows.forEach(r => console.log(`${r.Field}|${r.Type}`));
        console.log("COLUNAS_END");
        process.exit(0);
    } catch (error) {
        console.error("Erro ao ler colunas:", error);
        process.exit(1);
    }
}

checkColumns();
