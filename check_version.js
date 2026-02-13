import fetch from 'node-fetch';

async function check() {
    try {
        const res = await fetch('https://sistema-gm-systems-e-gestao-patrimo.vercel.app/api/health');
        const text = await res.text();
        console.log('🌍 API Root Response:', text);
    } catch (e) {
        console.error('❌ Error checking version:', e.message);
    }
}

check();
