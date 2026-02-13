
const { execSync } = require('child_process');
const https = require('https');

const TARGET_VERSION = '2.12.1-FIX-LOGIN-BIND';
const VERCEL_URL = 'https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/version';

function deploy() {
    console.log('1. Starting Vercel Deploy...');
    try {
        execSync('npx vercel --prod --force', { stdio: 'inherit' });
    } catch (e) {
        console.error('❌ Deploy failed locally.');
        process.exit(1);
    }
}

function checkVersion(retries = 10) {
    console.log(`\n2. Verifying Version (Attempts left: ${retries})...`);

    https.get(VERCEL_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('   Current Cloud Version:', json.version);
                if (json.version === TARGET_VERSION) {
                    console.log('✅ DEPLOY SUCCESSFUL! Cloud is running the fixed version.');
                    process.exit(0);
                } else {
                    console.log('⚠️  Version mismatch. Waiting for propagation...');
                    if (retries > 0) {
                        setTimeout(() => checkVersion(retries - 1), 5000);
                    } else {
                        console.error('❌ TIMEOUT: Cloud version did not update in time.');
                        process.exit(1);
                    }
                }
            } catch (e) {
                console.log('   Invalid response (server might be restarting)...');
                if (retries > 0) setTimeout(() => checkVersion(retries - 1), 5000);
            }
        });
    }).on('error', (e) => {
        console.log('   Connection error:', e.message);
        if (retries > 0) setTimeout(() => checkVersion(retries - 1), 5000);
    });
}

deploy();
// Start checking after a short delay
setTimeout(() => checkVersion(), 10000);
