import fetch from 'node-fetch';

const API_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api';

async function testSync() {
    console.log('🚀 Testando Sync na Vercel...');

    // 1. Login para pegar Token
    console.log(`1. Fazendo Login em: ${API_URL}/auth/login`);
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@gmsystems.com',
            password: 'admin',
            client_id: '11111111-1111-1111-1111-111111111111'
        })
    });

    console.log(`Status: ${loginRes.status} ${loginRes.statusText}`);
    const rawText = await loginRes.text();

    try {
        const loginData = JSON.parse(rawText);
        if (!loginData.success) {
            console.error('❌ Falha no Login (Lógica):', loginData);
            return;
        }
        console.log('✅ Login OK! Token obtido.');
        var token = loginData.token; // Var hoisting for scope
    } catch (e) {
        console.error('❌ ERRO CRÍTICO: Resposta não é JSON.');
        console.error('RAW RESPONSE:', rawText.substring(0, 500)); // Show first 500 chars
        return;
    }

    // 2. Tentar Inserir um Ativo
    console.log('2. Tentando Inserir Ativo...');
    const payload = {
        operations: [
            {
                id: 'debug-' + Date.now(),
                action: 'INSERT',
                table: 'assets',
                payload: {
                    name: 'Ativo Teste Full Mapping',
                    description: 'Teste de Mapeamento Completo',
                    category: 'Hardware', // Should map to categoria
                    manufacturer: 'Dell', // Should map to fabricante
                    model: 'Latitude 5420', // Should map to modelo
                    serialNumber: 'ABC123XYZ', // Should map to numero_serie
                    plate: 'GM-9999', // Should map to codigo_patrimonio
                    value: 5000.00,
                    status: 'NOVO'
                }
            }
        ]
    };

    const syncRes = await fetch(`${API_URL}/assets/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const syncData = await syncRes.json();
    console.log('🔍 Resposta Sync:', JSON.stringify(syncData, null, 2));

    if (syncData.success) {
        console.log('✅ SUCESSO! O backend está aceitando dados.');
    } else {
        console.log('❌ FALHA! O backend rejeitou.');
    }
}

testSync();
