
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

async function sendTest() {
    console.log('--- EMAIL TEST START ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('User:', process.env.SMTP_USER);

    // Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        console.log('Sending to gabriel.sistem.ai03@gmail.com...');
        const info = await transporter.sendMail({
            from: '"GM Systems Test" <no-reply@gmsystems.com.br>',
            to: "gabriel.sistem.ai03@gmail.com",
            subject: "Teste de E-mail - GM Systems v2.7",
            text: "Se você recebeu este e-mail, o sistema de envio está funcionando perfeitamente! O problema era apenas o registro do usuário.",
            html: "<b>Se você recebeu este e-mail, o sistema de envio está funcionando perfeitamente!</b><br>O problema era apenas o código de registro do usuário, que já foi corrigido."
        });

        console.log("✅ Message sent: %s", info.messageId);
        console.log("✅ Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

sendTest();
