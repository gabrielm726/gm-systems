import fetch from 'node-fetch';

async function testLogin() {
    console.log('Tentando logar com admin@gmsystems.com.br...');
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@gmsystems.com.br',
                password: '123456',
                client_id: '11111111-1111-1111-1111-111111111111'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCESSO! Login funcionou.');
            console.log('Token JWT recebido:', data.token.substring(0, 20) + '...');
            console.log('Dados do Usuário:', data.user.nome, '-', data.user.role);
        } else {
            console.error('❌ ERRO NO LOGIN:', data);
        }
    } catch (error) {
        console.error('❌ ERRO DE CONEXÃO:', error.message);
    }
}

// Pequeno delay para garantir que o server subiu
setTimeout(testLogin, 2000);
