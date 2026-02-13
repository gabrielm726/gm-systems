
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function addColumn() {
    console.log('Connecting to Cloud DB...', process.env.DB_HOST);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected! Adding "technical_data" column to "assets"...');

        // Check if exists first to avoid error? Or just ALTER IGNORE? MySQL doesn't support IF NOT EXISTS for columns easily in one line without procedure, but we can try catch.
        try {
            await connection.execute(`
                ALTER TABLE assets 
                ADD COLUMN technical_data TEXT NULL COMMENT 'JSON Dump for dynamic fields';
            `);
            console.log('✅ Column "technical_data" added successfully.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Column "technical_data" already exists.');
            } else {
                throw e;
            }
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

addColumn();
