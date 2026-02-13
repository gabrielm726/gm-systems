
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://127.0.0.1:3001/api';
const EMAIL = 'admin@gmsystems.com.br';
const PASSWORD = '123456';
const CLIENT_ID = '11111111-1111-1111-1111-111111111111';

async function testSync() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                client_id: CLIENT_ID
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(`Login Failed: ${loginData.message}`);

        const token = loginData.token;
        console.log('Login success! Token:', token.substring(0, 15) + '...');

        console.log('2. Sending Sync Batch...');
        const assetId = uuidv4();
        const payload = {
            operations: [
                {
                    id: uuidv4(),
                    table: 'assets',
                    action: 'INSERT',
                    payload: {
                        id: assetId,
                        nome: 'Asset Auto-Healed FK',
                        codigo_patrimonio: 'SCRIPT-FK-TEST',
                        state: 'GOOD',
                        locationId: 'INVALID-LOCATION-ID-999'
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
        console.log('Sync Response:', JSON.stringify(syncData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSync();
