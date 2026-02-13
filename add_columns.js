import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner',
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function addColumns() {
    try {
        console.log("🔌 Connecting to DB to ADD COLUMNS...");
        const connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connected!");

        // Add avatar_url to users
        try {
            console.log("🛠 Adding avatar_url to users...");
            await connection.query("ALTER TABLE users ADD COLUMN avatar_url TEXT");
            console.log("✅ avatar_url added.");
        } catch (e) {
            console.log("⚠️ avatar_url error (probably exists):", e.message);
        }

        // Add role to users
        try {
            console.log("🛠 Adding role to users...");
            await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'VIEWER'");
            console.log("✅ role added.");
        } catch (e) {
            console.log("⚠️ role error (probably exists):", e.message);
        }

        await connection.end();
    } catch (e) {
        console.error("❌ Fatal Error:", e.message);
    }
}

addColumns();
