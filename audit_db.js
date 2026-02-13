import 'dotenv/config';
import pool from './backend/src/config/database.js';

async function auditDatabase() {
    try {
        console.log("--- START DB AUDIT ---");

        // 1. List Tables
        const [tables] = await pool.query("SHOW TABLES");
        console.log("TABLES:");
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(JSON.stringify(tableNames, null, 2));

        // 2. Describe Key Tables
        for (const table of tableNames) {
            console.log(`\nSCHEMA FOR: ${table}`);
            const [columns] = await pool.query(`SHOW COLUMNS FROM ${table}`);
            // Simplified output: Field, Type
            columns.forEach(c => console.log(`${c.Field} | ${c.Type}`));
        }

        console.log("--- END DB AUDIT ---");
        process.exit(0);
    } catch (error) {
        console.error("Audit failed:", error);
        process.exit(1);
    }
}

auditDatabase();
