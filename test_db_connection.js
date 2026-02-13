import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testConnection() {
    console.log('🔌 Testando conexão com TiDB...');

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 4000,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    };

    console.log('Config:', { ...config, password: '***' });

    try {
        const conn = await mysql.createConnection(config);
        console.log('✅ Conexão BEM SUCEDIDA!');

        // Check if users table exists
        const [tables] = await conn.execute("SHOW TABLES LIKE 'users'");
        if (tables.length === 0) {
            console.error('❌ ERRO CRÍTICO: Tabela "users" NÃO EXISTE no banco de dados "test" da nuvem!');
        } else {
            console.log('✅ Tabela "users" encontrada.');
            // Check specifically for the user trying to login
            const [users] = await conn.execute("SELECT * FROM users WHERE email = 'gabriel.sistem.ai03@gmail.com'");
            if (users.length > 0) {
                console.log('✅ USUÁRIO ENCONTRADO:', users[0].email, users[0].status);
                console.log('🆔 Client ID no Banco:', users[0].client_id);
            } else {
                console.error('❌ USUÁRIO NÃO ENCONTRADO no banco da nuvem.');
            }
        }
        await conn.end();
    } catch (error) {
        console.error('❌ FALHA NA CONEXÃO:', error.message);
        if (error.code === 'HANDSHAKE_SSL_ERROR') {
            console.error('Dica: Verifique se o certificado CA está correto ou tente rejectUnauthorized: false (menos seguro).');
        }
    }
}

testConnection();
