import 'dotenv/config';
import pool from './src/config/database.js';

async function runMigration() {
    console.log("🚀 Starting Migration: Add avatar_url to users table...");
    try {
        const connection = await pool.getConnection();

        // Check if column exists
        const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'avatar_url'");

        if (columns.length === 0) {
            console.log("⚠️ Column 'avatar_url' missing. Adding it now...");
            await connection.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER email");
            console.log("✅ Column 'avatar_url' added successfully.");
        } else {
            console.log("ℹ️ Column 'avatar_url' already exists.");
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
}

runMigration();
