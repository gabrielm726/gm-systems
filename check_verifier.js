import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '4Uvh9vGc9cheu8w.app_runner', // Using the claimed safe user
    password: 'GMsytems_Secure_2026_Key!',
    database: 'test',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

async function check() {
    console.log('🔍 Testes de Segurança (Safe User)');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexão: SUCESSO (O usuário existe)');

        // Teste 1: LEITURA (Deve Permitir)
        await connection.query('SELECT 1');
        console.log('✅ Leitura (SELECT): PERMITIDO');

        // Teste 2: DELETE (Deve Permitir - Dados, mas não Tabela?)
        // O user deve poder INSERT/UPDATE/DELETE DADOS, mas não DROP TABLE.

        // Teste 3: DESTOCAMENTO (DROP TABLE) - DEVE FALHAR
        console.log('⚠️ Tentando destruir tabela (DROP)...');
        try {
            await connection.query('DROP TABLE IF EXISTS users_fake_test');
            console.log('❌ FALHA GRAVE: O Usuário CONSEGUIU rodar DROP! (PERIGO)');
        } catch (err) {
            if (err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.message.includes('denied')) {
                console.log('✅ BLOQUEADO: O usuário NÃO tem permissão de DROP. (Seguro)');
            } else {
                console.log('❓ Erro inesperado no DROP:', err.message);
            }
        }

    } catch (error) {
        console.error('❌ Erro Geral:', error.message);
    } finally {
        if (connection) connection.end();
    }
}

check();
