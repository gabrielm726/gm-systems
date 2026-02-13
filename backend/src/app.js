import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pool from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import backupRoutes from './routes/backupRoutes.js';

const app = express();

// Middleware de Segurança e Parsing
// app.use(helmet()); // Temporarily disabled for debugging
app.use(cors()); // Configurar restrições de domínio em produção!
app.use(express.json());

// Logger Middleware (Adaptação para Vercel: Apenas Console)
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Debug Global Error
app.use((err, req, res, next) => {
    console.error('🔥 [GLOBAL ERROR HANDLER]', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Verificação de Sanidade do Banco de Dados ao iniciar (Apenas se não for Vercel Cold Start)
// Na Vercel, o pool é gerenciado externamente, mas manteremos o check para segurança.
pool.getConnection()
    .then(connection => {
        // console.log('✅ Conexão com MySQL estabelecida com sucesso.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Falha ao conectar no MySQL:', err);
        // Não matamos o processo na Vercel, apenas logamos o erro de conexão inicial
    });

// Rota de Healthcheck
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date(), env: process.env.VERCEL ? 'Vercel' : 'Local' });
});

app.get('/version', (req, res) => {
    res.status(200).json({ version: '2.13.0-VERCEL-READY' });
});

// Importar e usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/backup', backupRoutes);

export default app;
