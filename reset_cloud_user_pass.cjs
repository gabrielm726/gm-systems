
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function resetPassword() {
    console.log('👷 Resetting Password for gabriel.sistem.ai03@gmail.com ...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const passwordPlain = '123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passwordPlain, salt);

        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, 'gabriel.sistem.ai03@gmail.com']
        );

        if (result.affectedRows > 0) {
            console.log('✅ Password Reset to "123" SUCCESS!');
        } else {
            console.log('❌ User not found or update failed.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) connection.end();
    }
}

resetPassword();
