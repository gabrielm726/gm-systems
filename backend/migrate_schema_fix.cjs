
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function migrateSchema() {
    console.log('--- STARTING SCHEMA MIGRATION ---');

    // Configura SSL (TiDB requirement)
    const sslConfig = process.env.DB_SSL ? { ...JSON.parse(process.env.DB_SSL), rejectUnauthorized: false } : undefined;

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: sslConfig
    });

    try {
        console.log('1. Checking CLIENTS table...');
        const [columns] = await connection.execute('SHOW COLUMNS FROM clients');
        const columnNames = columns.map(c => c.Field);
        console.log('Existing columns:', columnNames);

        // MIGRATION 1: Rename 'name' to 'nome' if needed
        if (columnNames.includes('name') && !columnNames.includes('nome')) {
            console.log('🔄 Migrating: name -> nome');
            await connection.execute('ALTER TABLE clients CHANGE name nome VARCHAR(255) NOT NULL');
            console.log('✅ Renamed.');
        }

        // MIGRATION 2: Add 'documento'
        if (!columnNames.includes('documento')) {
            console.log('➕ Adding: documento (No Unique for now)');
            await connection.execute('ALTER TABLE clients ADD COLUMN documento VARCHAR(20) NULL');
            console.log('✅ Added documento.');

            // Try adding unique index separately
            try {
                await connection.execute('CREATE UNIQUE INDEX idx_client_doc ON clients(documento)');
                console.log('✅ Added Unique Index.');
            } catch (e) { console.log('⚠️ Could not add unique index, skipping.', e.message); }
        }

        // MIGRATION 3: Add 'estado'
        if (!columnNames.includes('estado')) {
            console.log('➕ Adding: estado');
            await connection.execute("ALTER TABLE clients ADD COLUMN estado CHAR(2) DEFAULT 'PE'");
            console.log('✅ Added estado.');
        }

        // MIGRATION 4: Add 'admin_master_email'
        if (!columnNames.includes('admin_master_email')) {
            console.log('➕ Adding: admin_master_email');
            await connection.execute('ALTER TABLE clients ADD COLUMN admin_master_email VARCHAR(255) NULL');
            console.log('✅ Added admin_master_email.');
        }

        // MIGRATION 5: Add 'tipo' column if missing
        if (!columnNames.includes('tipo')) {
            console.log('➕ Adding: tipo');
            await connection.execute("ALTER TABLE clients ADD COLUMN tipo ENUM('PREFEITURA', 'EMPRESA_PRIVADA') DEFAULT 'PREFEITURA'");
            console.log('✅ Added tipo.');
        }


        console.log('------------------------------------------------');
        console.log('2. Checking USERS table...');
        const [userCols] = await connection.execute('SHOW COLUMNS FROM users');
        const userColNames = userCols.map(c => c.Field);
        console.log('Existing user columns:', userColNames);

        // MIGRATION 6: Add 'motivo_cadastro'
        if (!userColNames.includes('motivo_cadastro')) {
            console.log('➕ Adding: motivo_cadastro');
            await connection.execute('ALTER TABLE users ADD COLUMN motivo_cadastro TEXT NULL');
            console.log('✅ Added motivo_cadastro.');
        }

        console.log('✨ MIGRATION COMPLETE!');

    } catch (error) {
        console.error('❌ MIGRATION FAILED:', error);
    } finally {
        await connection.end();
    }
}

migrateSchema();
