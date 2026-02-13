
const https = require('https');

// CONFIG
const API_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/assets/sync';
// const API_URL = 'http://localhost:3002/api/assets/sync'; // Toggle for local debug

// 1. MOCK LOGIN (We need a token)
// P.S. Since I don't have a login endpoint in this script, I'll use a hardcoded token if I can, 
// OR I have to implement a quick login flow here. Let's do a quick login.

const LOGIN_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/auth/login';

// DATA TO TEST
const TEST_ASSET = {
    id: 'TEST-CLOUD-FIX-' + Date.now(),
    name: 'Debug Asset Vercel',
    description: 'Created via debug script to verify cloud sync',
    value: 123.45,
    category: 'Hardware',
    status: 'BOM',
    locationId: 'LOC-001', // Should map to location_id
    technical_data: JSON.stringify({ voltage: '220V', color: 'Blue', tested: true })
};

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
    console.log('--- DEBUG CLOUD SYNC REAL ---');
    console.log('Target:', API_URL);

    try {
        // 1. Login
        console.log('\n1. Logging in as master@gmsystems.com...');
        const loginRes = await post(LOGIN_URL, {
            email: 'master@gmsystems.com',
            password: '123' // Assuming this is the test password
        });

        if (loginRes.status !== 200 || !loginRes.body.token) {
            console.error('❌ Login Failed:', loginRes.body);
            // Try fallback credentials if 123 fails?
            // console.log('Trying fallback...'); 
            return;
        }

        const token = loginRes.body.token;
        console.log('✅ Login Success! Token obtained.');

        // 2. Sync Asset
        console.log('\n2. Sending Sync Payload...');
        const payload = {
            operations: [
                {
                    id: 'OP-' + Date.now(),
                    table: 'assets',
                    action: 'INSERT',
                    payload: TEST_ASSET
                }
            ]
        };

        const syncRes = await post(API_URL, payload, token);

        console.log('\n--- SERVER RESPONSE ---');
        console.log('Status:', syncRes.status);
        console.log('Body:', JSON.stringify(syncRes.body, null, 2));

        if (syncRes.status === 200 && syncRes.body.success) {
            console.log('\n✅ SUCCESS! The server accepted the data.');
        } else {
            console.error('\n❌ FAILED! Server rejected the data.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

run();
