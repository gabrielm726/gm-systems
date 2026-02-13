
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const API_URL = 'http://localhost:3001/api';
// Hardcoded credentials that we just reset
const MASTER_EMAIL = 'admin@gm.gov.br';
const MASTER_PASSWORD = 'admin';
const CLIENT_ID = '11111111-1111-1111-1111-111111111111';

async function run() {
    console.log(`Tentando login com: ${MASTER_EMAIL} / ${MASTER_PASSWORD}`);
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: MASTER_EMAIL, password: MASTER_PASSWORD, client_id: CLIENT_ID })
        });

        const data = await res.json();
        console.log('Status Code:', res.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log("✅ Login SUCESSO!");
        } else {
            console.error("❌ Login FALHOU!");
        }

    } catch (err) {
        console.error("❌ Erro de conexão:", err);
    }
}

run();
