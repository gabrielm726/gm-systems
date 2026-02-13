
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function checkUser() {
    console.log('🔍 Checking for user: gabriel.sistem.ai03@gmail.com ...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT id, nome, email, client_id, status, role FROM users WHERE email = ?',
            ['gabriel.sistem.ai03@gmail.com']
        );

        if (rows.length > 0) {
            console.log('✅ User FOUND:', rows[0]);

            // Also check if Client exists
            const [clients] = await connection.execute(
                'SELECT * FROM clients WHERE id = ?',
                [rows[0].client_id]
            );

            if (clients.length > 0) {
                console.log('✅ Client FOUND:', clients[0].nome);
            } else {
                console.error('❌ User exists but Client ID is INVALID/MISSING in clients table!');
            }

        } else {
            console.log('❌ User NOT FOUND in Cloud Database.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) connection.end();
    }
}

checkUser();
