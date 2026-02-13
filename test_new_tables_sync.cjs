
const https = require('https');

// CONFIG
const API_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/assets/sync';
const LOGIN_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/auth/login';

function post(url, data, token) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(data))
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    console.log('--- TEST NEW TABLES SYNC ---');

    try {
        // 1. Login
        console.log('\n1. Login...');
        const loginRes = await post(LOGIN_URL, {
            email: 'gabriel.sistem.ai03@gmail.com',
            password: '123'
        });

        if (loginRes.status !== 200 || !loginRes.body.token) {
            console.error('❌ Login Failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.token;
        console.log('✅ Login Success!');

        // 2. Sync Supplier & Cost
        console.log('\n2. Syncing Supplier & Cost...');

        const supplierId = 'SUP-' + Date.now();
        const costId = 'COST-' + Date.now();

        const payload = {
            operations: [
                {
                    id: 'OP-SUP-' + Date.now(),
                    table: 'suppliers',
                    action: 'INSERT',
                    payload: {
                        id: supplierId,
                        name: 'Fornecedor Teste VSCode',
                        supplierType: 'PRODUTO', // Camel -> Snake handled?
                        status: 'ATIVO'
                    }
                },
                {
                    id: 'OP-COST-' + Date.now(),
                    table: 'costs',
                    action: 'INSERT',
                    payload: {
                        id: costId,
                        description: 'Custo Teste Integração',
                        value: 150.00,
                        supplierId: supplierId, // Camel -> Snake handled?
                        status: 'PENDENTE'
                    }
                }
            ]
        };

        const syncRes = await post(API_URL, payload, token);

        console.log('\n--- SERVER RESPONSE ---');
        console.log('Status:', syncRes.status);
        console.log('Body:', JSON.stringify(syncRes.body, null, 2));

        if (syncRes.status === 200 && syncRes.body.success) {
            console.log('\n✅ SUCCESS! New tables are working.');
        } else {
            console.error('\n❌ FAILED! Server rejected new tables.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

run();
