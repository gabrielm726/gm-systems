
require('dotenv').config({ path: 'backend/.env' });
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function testConnection() {
    console.log('--- DIAGNOSTIC START ---');
    console.log('Environment:', process.env.ENV);
    console.log('DB Host:', process.env.DB_HOST);
    console.log('DB User:', process.env.DB_USER);

    let connection;
    try {
        console.log('1. Testing Connection...');
        const sslConfig = process.env.DB_SSL ? { ...JSON.parse(process.env.DB_SSL), rejectUnauthorized: false } : undefined;

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: sslConfig
        });
        console.log('✅ Connection Successful!');

        console.log('2. Testing UUID Generation...');
        const testId = uuidv4();
        console.log('✅ UUID Generated:', testId);

        console.log('3. Testing Bcrypt...');
        const hash = await bcrypt.hash('test', 10);
        console.log('✅ Bcrypt Hash Generated');

        console.log('4. Testing Client Insertion (Simulation)...');
        // We won't actually insert to avoid garbage, but we can describe table
        const [rows] = await connection.execute('DESCRIBE clients');
        console.log('✅ Clients Table Exists. Columns:', rows.map(r => r.Field).join(', '));

        const [userRows] = await connection.execute('DESCRIBE users');
        console.log('✅ Users Table Exists. Columns:', userRows.map(r => r.Field).join(', '));

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        if (connection) await connection.end();
        console.log('--- DIAGNOSTIC END ---');
    }
}

testConnection();
