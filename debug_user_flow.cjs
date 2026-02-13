
const https = require('https');

// CONFIG
const API_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/assets/sync';
const LOGIN_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/auth/login';

// TARGET USER
const EMAIL = 'gabriel.sistem.ai03@gmail.com';
const PASSWORD = '123'; // Assuming default test password. If this fails, user needs pass reset.

// DATA TO TEST
const TEST_ASSET = {
    id: 'TEST-USER-SPECIFIC-' + Date.now(),
    name: 'Debug Asset Gabriel',
    description: 'Created specificially for user gabriel.sistem.ai03',
    value: 999.99,
    category: 'Hardware',
    status: 'BOM',
    locationId: 'LOC-001',
    technical_data: JSON.stringify({ voltage: '110V', color: 'Red', tested: true })
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
    console.log(`--- DEBUG USER: ${EMAIL} ---`);

    try {
        // 1. Login
        console.log(`\n1. Logging in as ${EMAIL}...`);
        const loginRes = await post(LOGIN_URL, {
            email: EMAIL,
            password: PASSWORD
        });

        if (loginRes.status !== 200 || !loginRes.body.token) {
            console.error('❌ Login Failed:', loginRes.body);
            console.log('⚠️  Please confirm if password is "123". If not, script cannot verify.');
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
            console.log('\n✅ SUCCESS! The server accepted the data for this user.');
        } else {
            console.error('\n❌ FAILED! Server error.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

run();
