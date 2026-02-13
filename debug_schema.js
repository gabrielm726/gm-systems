import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function checkSchema() {
    try {
        console.log("🔌 Connecting to DB...");
        const connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connected!");

        console.log("\n--- TABLE: users ---");
        const [usersCols] = await connection.query("DESCRIBE users");
        usersCols.forEach(col => console.log(`${col.Field} (${col.Type})`));

        console.log("\n--- TABLE: assets ---");
        const [assetsCols] = await connection.query("DESCRIBE assets");
        assetsCols.forEach(col => console.log(`${col.Field} (${col.Type})`));

        await connection.end();
    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

checkSchema();
