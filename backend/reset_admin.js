import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
    console.log("Conectando ao banco...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'gm_systems_central',
        ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : { rejectUnauthorized: true }
    });

    try {
        const email = 'admin@gm.gov.br';
        const newPassword = 'admin';

        console.log(`Gerando novo hash para senha: ${newPassword}`);
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log(`Atualizando usuário ${email}...`);

        // Verifica se existe primeiro pelo ID FIXO
        const [rows] = await connection.execute('SELECT id FROM users WHERE id = ?', ['22222222-2222-2222-2222-222222222222']);

        if (rows.length === 0) {
            console.log('⚠️ Usuário não encontrado! Criando usuário de emergência...');
            // Cria usuário se não existir (ID fixo do seed)
            await connection.execute(`
                INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro)
                VALUES (
                    '22222222-2222-2222-2222-222222222222',
                    '11111111-1111-1111-1111-111111111111',
                    'Administrador Master',
                    ?, ?, 'MASTER', 'ATIVO', 'Emergency Reset'
                )
            `, [email, hash]);
        } else {
            console.log('🔄 Usuário existente encontrado pelo ID. Atualizando credenciais...');
            // Atualiza existente forçando o email correto
            await connection.execute(
                'UPDATE users SET email = ?, password_hash = ?, status = "ATIVO" WHERE id = ?',
                [email, hash, '22222222-2222-2222-2222-222222222222']
            );
        }

        console.log('✅ Senha redefinida com sucesso!');
        console.log(`Login: ${email}`);
        console.log(`Senha: ${newPassword}`);

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await connection.end();
    }
}

resetAdmin();
