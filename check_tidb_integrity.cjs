
require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function check() {
    console.log('1. Connecting to TiDB...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Connected!');

        // Check Assets Schema
        const [cols] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'technical_data'
        `, [process.env.DB_NAME]);

        if (cols.length > 0) {
            console.log('✅ Column "technical_data" FOUND in "assets" table.');
        } else {
            console.error('❌ Column "technical_data" MISSING in "assets" table!');
            process.exit(1);
        }

        // Check Locations Schema (names)
        const [locCols] = await connection.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'locations'
        `, [process.env.DB_NAME]);

        const locColNames = locCols.map(c => c.COLUMN_NAME);
        console.log('Locations Columns:', locColNames.join(', '));
        if (locColNames.includes('name') && locColNames.includes('address')) {
            console.log('✅ Locations table has English columns (name, address).');
        } else {
            console.warn('⚠️ Locations table might use Portuguese columns?');
        }

        await connection.end();
        console.log('\n✅ TIDB DATABASE INTEGRITY CHECK PASSED!');

    } catch (e) {
        console.error('❌ CHECK FAILED:', e.message);
        process.exit(1);
    }
}

check();
