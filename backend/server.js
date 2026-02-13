import 'dotenv/config';
import app from './src/app.js'; // Importa a lógica do Express

const PORT = 3002;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Local rodando na porta ${PORT} (0.0.0.0)`);
    console.log(`🔒 Modo de Segurança: ATIVO`);
    console.log(`🏢 Isolamento Multi-inquilino: ATIVO`);
});
