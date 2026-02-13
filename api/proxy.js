
import mysql from 'mysql2/promise';

// EDGE FUNCTION / SERVERLESS API for TiDB
// This allows the Frontend to query TiDB securely without exposing credentials in the client code (if env vars are used on server)
// For now, we use the env vars from the project.

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { sql, params } = req.body;

    if (!sql) {
        return res.status(400).json({ error: 'SQL query required' });
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || "gateway01.us-east-1.prod.aws.tidbcloud.com",
            user: process.env.DB_USER || "4Uvh9vGc9cheu8w.root",
            password: process.env.DB_PASSWORD || "M3wbqSdXQ2xrwnD8",
            database: process.env.DB_NAME || "test",
            port: Number(process.env.DB_PORT) || 4000,
            ssl: {
                minVersion: "TLSv1.2",
                rejectUnauthorized: true
            }
        });

        const [rows] = await connection.execute(sql, params || []);
        await connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error('TiDB Error:', error);
        res.status(500).json({ error: error.message });
    }
}
