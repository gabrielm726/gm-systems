import app from './api/index.js';

const PORT = 3001;

console.log('🚀 Iniciando Servidor Backend Local...');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Backend LOCAL rodando com sucesso!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\nMANTENHA ESTA JANELA ABERTA ENQUANTO USA O SISTEMA.\n`);
});
