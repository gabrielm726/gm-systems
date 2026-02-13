import 'dotenv/config';
import pool from './src/config/database.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    console.log("🚀 Starting Full Schema Migration...");
    try {
        const sqlPath = path.join(process.cwd(), 'backend', 'database', '003_complete_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon via regex but respect blocks (simple split might work for valid SQL file)
        // Better: execute statement by statement or as one block if driver supports it.
        // MySQL2 execute supports multiple statements if configured? 
        // Let's rely on pool.query with multipleStatements: true option if possible, 
        // OR split manually.

        // Re-creating pool with multipleStatements
        const connection = await pool.getConnection();

        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`📜 Found ${statements.length} SQL statements.`);

        for (const statement of statements) {
            try {
                // Check if it's USE or comments
                if (statement.toUpperCase().startsWith('USE')) continue;
                if (statement.startsWith('--')) continue;

                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await connection.query(statement);
            } catch (err) {
                // Ignore "Column already exists" or "Table already exists" errors to be idempotent
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log("⚠️ Already exists, skipping.");
                } else {
                    console.error("❌ Error executing statement:", err.message);
                    // Don't exit, try next
                }
            }
        }

        console.log("✅ Migration completed.");
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error("❌ Migration Script Error:", error);
        process.exit(1);
    }
}

runMigration();
