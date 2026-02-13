import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.root',
    password: 'M3wbqSdXQ2xrwnD8',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function migrateSchema() {
    console.log('🏗️ Atualizando Schema da Nuvem (Adicionando Colunas Faltantes)...');
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Helper to add column safely
        const addCol = async (table, col, type) => {
            try {
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
                console.log(`✅ Coluna adicionada: ${table}.${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Coluna já existe: ${table}.${col}`);
                } else {
                    console.error(`❌ Erro em ${col}:`, e.message);
                }
            }
        };

        // 1. Assets Table Extensions
        await addCol('assets', 'modelo', 'VARCHAR(255)');
        await addCol('assets', 'fabricante', 'VARCHAR(255)');
        await addCol('assets', 'numero_serie', 'VARCHAR(255)');
        await addCol('assets', 'numero_nota_fiscal', 'VARCHAR(255)');
        await addCol('assets', 'url_imagem', 'TEXT');
        await addCol('assets', 'url_qr_code', 'TEXT');
        await addCol('assets', 'status_uso', 'VARCHAR(50)'); // For 'Novo', 'Usado'

        // ROUND 2: Extras identified in App.tsx
        await addCol('assets', 'responsavel_id', 'VARCHAR(255)');
        await addCol('assets', 'data_aquisicao', 'VARCHAR(50)'); // Keep flexible format

        // ROUND 3: Plate / Code
        await addCol('assets', 'codigo_patrimonio', 'VARCHAR(50)');

        // 2. Ensure basic columns exist (just in case)
        // 'categoria' should exist, but let's be safe if it was missing
        await addCol('assets', 'categoria', 'VARCHAR(100)');

        console.log('🏁 Migração de Schema Concluída.');

    } catch (error) {
        console.error('Erro Geral:', error.message);
    } finally {
        connection.end();
    }
}

migrateSchema();
