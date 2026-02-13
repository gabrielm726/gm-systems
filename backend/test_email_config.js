import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import nodemailer from 'nodemailer';

async function testConfig() {
    console.log('Testing Email Configuration...');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Falta configuração SMTP no .env');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        console.log(`📡 Tentando conectar em ${process.env.SMTP_HOST}...`);
        await transporter.verify();
        console.log('✅ SUCESSO! Conexão SMTP estabelecida e autenticada.');
        console.log('📨 Detalhes: ' + process.env.SMTP_USER);

    } catch (error) {
        console.error('❌ FALHA na conexão SMTP:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.error('💡 Dica: Verifique se a chave/senha foi copiada corretamente sem espaços extras.');
        }
    }
}

testConfig();
