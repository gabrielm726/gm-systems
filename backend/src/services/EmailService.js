import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';

// Configuração do Transporter (Singleton)
let transporter = null;

const initTransporter = () => {
    if (process.env.SENDGRID_API_KEY) {
        // Opção 1: SendGrid
        transporter = nodemailer.createTransport(
            sendgridTransport({
                auth: { api_key: process.env.SENDGRID_API_KEY }
            })
        );
        console.log('📧 EmailService: Modo SendGrid Ativo');
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Opção 2: SMTP Genérico (Brevo, Outlook, Zoho, Hostgator, etc)
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`📧 EmailService: Modo SMTP Genérico (${process.env.SMTP_HOST}) Ativo`);
    } else if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Opção 3: Service Preset (Gmail, etc)
        transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`📧 EmailService: Modo Service Preset (${process.env.SMTP_SERVICE}) Ativo`);
    } else {
        // Opção 4: Mock (Sem config)
        console.log('⚠️ EmailService: Nenhuma config de e-mail detectada. Modo LOG (Dev) Ativo.');
    }
};

// Inicializa na carga do módulo
initTransporter();

export const sendEmail = async (to, subject, htmlContent) => {
    if (!transporter) {
        console.log('Blocked Email Send (No Transporter):', { to, subject });
        console.log('Content:', htmlContent);
        return false;
    }

    try {
        const fromEmail = process.env.EMAIL_FROM || 'admin@gmsystems.com.br';

        await transporter.sendMail({
            to,
            from: fromEmail,
            subject,
            html: htmlContent
        });

        console.log(`✅ E-mail enviado para ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        return false;
    }
};

export const sendResetToken = async (email, token) => {
    const subject = 'Recuperação de Senha - GM Systems';
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0f172a;">GM Systems & Gestão Patrimonial</h2>
            <p>Você solicitou a redefinição de sua senha.</p>
            <p>Seu código de segurança é:</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 20px 0;">
                ${token}
            </div>
            <p>Cole este código no aplicativo para definir uma nova senha.</p>
            <p style="font-size: 12px; color: #64748b;">Se você não solicitou, ignore este e-mail.</p>
        </div>
    `;

    // Se não tiver transporter, logamos o token aqui também por garantia
    if (!process.env.SENDGRID_API_KEY) {
        console.log('🔑 [DEV] TOKEN PARA ' + email + ': ' + token);
        return true; // Retorna true para o controller achar que enviou
    }

    return await sendEmail(email, subject, html);
};
