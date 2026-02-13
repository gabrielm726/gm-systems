
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api';
// Use the fallback secret from api/index.js line 36
const JWT_SECRET = 'fallback_secret_vercel_fix';
// const JWT_SECRET = 'dev_secret_fallback_123'; // Alternative if logic is weird

const USER_ID = 'c5cd457d-93cd-461d-8982-000b775db448';

async function testSync() {
    console.log("🚀 Iniciando Simulação de Sync do Usuário Real...");

    // 1. Generate Token
    const token = jwt.sign({ id: USER_ID }, JWT_SECRET, { expiresIn: '1h' });
    console.log("🔑 Token Gerado (Simulado):", token.substring(0, 20) + "...");

    // 2. Create Payload
    const assetId = uuidv4();
    const payload = {
        id: assetId,
        name: "Ativo Teste Real User " + new Date().toISOString().split('T')[1],
        category: "TESTE_REAL",
        value: 99.99,
        status: "BOM",
        description: "Teste de persistência simulando usuário real"
    };

    const operations = [
        {
            action: 'INSERT',
            table: 'assets',
            payload: payload
        }
    ];

    console.log("📦 Payload:", JSON.stringify(operations, null, 2));

    try {
        const response = await fetch(`${API_URL}/assets/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ operations })
        });

        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("📄 Resposta:", JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log("✅ SUCESSO! O Backend aceitou o sync.");
        } else {
            console.error("❌ FALHA! O Backend rejeitou.");
        }

    } catch (error) {
        console.error("❌ Erro de Rede/Script:", error);
    }
}

testSync();
