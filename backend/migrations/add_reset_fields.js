import 'dotenv/config';
import mysql from 'mysql2/promise';

async function addResetFields() {
    console.log("Conectando ao banco...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'gm_systems_central',
        ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : { rejectUnauthorized: true }
    });

    try {
        console.log('Verificando colunas...');

        // Verifica se as colunas já existem para evitar erro
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('reset_password_token', 'reset_password_expires')
        `, [process.env.DB_NAME || 'gm_systems_central']);

        const existingColumns = columns.map(c => c.COLUMN_NAME);

        if (!existingColumns.includes('reset_password_token')) {
            console.log('Adicionando reset_password_token...');
            await connection.execute('ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL AFTER status');
        }

        if (!existingColumns.includes('reset_password_expires')) {
            console.log('Adicionando reset_password_expires...');
            await connection.execute('ALTER TABLE users ADD COLUMN reset_password_expires DATETIME NULL AFTER reset_password_token');
        }

        console.log('✅ Migração concluída com sucesso!');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await connection.end();
    }
}

addResetFields();
