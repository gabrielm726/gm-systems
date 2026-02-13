import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function forceMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'gm_systems_central',
        multipleStatements: true
    });

    try {
        console.log('--- REINICIANDO TABELAS DE RECURSOS ---');

        // 1. Drop existing tables (Reversed order for FK constraints)
        console.log('Dropping old tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS assets');
        await connection.query('DROP TABLE IF EXISTS locations');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Read SQL
        const sqlPath = path.join(process.cwd(), 'database', '002_create_resources.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // 3. Execute
        console.log('Creating new schema...');
        await connection.query(sql);

        console.log('✅ Migração Concluída com Sucesso! Tabelas recriadas.');

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await connection.end();
    }
}

forceMigration();
