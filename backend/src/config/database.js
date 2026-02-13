import mysql from 'mysql2/promise';

// Configuração do Pool de Conexões
const pool = mysql.createPool({
    // CREDENTIALS INJECTED BY MAIN PROCESS (SECURE BOOT)
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'test',
    port: 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // TiDB / MySQL standard secure connection
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

export default pool;
