
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function testRegistration() {
    console.log('--- TESTE DE REGISTRO REAL (SEM BUILD) ---');
    console.log('DB Host:', process.env.DB_HOST);

    // 1. Config DB
    const sslConfig = process.env.DB_SSL ? { ...JSON.parse(process.env.DB_SSL), rejectUnauthorized: false } : undefined;
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: sslConfig
    });

    try {
        // Dados de Teste
        const client_id = uuidv4();
        const nomeOrg = "Prefeitura Teste " + Date.now();
        const cnpj = "00000000000" + Math.floor(Math.random() * 1000);
        const email = "teste.registro." + Date.now() + "@gmsystems.com";
        const password = "senha_forte_123";
        const motivo = "Teste de depuração";

        console.log(`\nTentando registrar:`);
        console.log(`- Org: ${nomeOrg}`);
        console.log(`- Email: ${email}`);

        // 1. Inserir Cliente
        console.log('\n1. Inserindo Cliente...');
        const qClient = `INSERT INTO clients (id, nome, documento, estado, admin_master_email, created_at) 
                         VALUES (?, ?, ?, 'UF', ?, NOW())`;
        await pool.execute(qClient, [client_id, nomeOrg, cnpj, email]);
        console.log('✅ Cliente inserido com sucesso!');

        // 2. Inserir Usuário
        console.log('\n2. Inserindo Usuário...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        const qUser = `INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro, created_at) 
                       VALUES (?, ?, ?, ?, ?, 'MASTER', 'ATIVO', ?, NOW())`;

        await pool.execute(qUser, [userId, client_id, "Admin Teste", email, hash, motivo]);
        console.log('✅ Usuário inserido com sucesso!');

        console.log('\n--- SUCESSO TOTAL: O REGISTRO FUNCIONA! ---');
        console.log('Se isso funcionou aqui, o problema no App pode ser cache ou versão antiga.');

    } catch (error) {
        console.error('\n❌ ERRO FATAL:', error);
        console.error('Código:', error.code);
        console.error('Mensagem:', error.sqlMessage);
    } finally {
        await pool.end();
    }
}

testRegistration();
