import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

const targetEmail = 'gabriel.sistem.ai03@gmail.com';

async function checkUser() {
    console.log(`🔍 Checking user: ${targetEmail}`);
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [targetEmail]);
        if (rows.length === 0) {
            console.log('❌ User NOT FOUND in Cloud DB.');
        } else {
            console.log('✅ User FOUND:');
            console.log(JSON.stringify(rows[0], null, 2));
            // Check assets for this user/client
            const user = rows[0];
            const [assets] = await connection.execute('SELECT id, name, created_at FROM assets WHERE client_id = ? ORDER BY created_at DESC LIMIT 5', [user.client_id]);
            console.log(`📦 Assets for Client ID ${user.client_id}:`);
            console.log(JSON.stringify(assets, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        connection.end();
    }
}

checkUser();
