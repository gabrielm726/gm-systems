
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read .env manually
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.error("❌ Arquivo .env não encontrado!");
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && !key.startsWith('#')) {
            envVars[key] = value;
        }
    }
});

const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const key = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_KEY;

console.log(`🔍 Testando conexão com: ${url}`);

if (!url || !key || url.includes('COLE_SUA')) {
    console.error("❌ Credenciais inválidas ou não preenchidas no .env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    try {
        // 2. Simple Auth Check (Doesn't throw, just returns session/null)
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error("❌ Erro no serviço de Auth:", authError.message);
            return;
        }
        console.log("✅ Serviço de Autenticação: ONLINE");

        // 3. Check for 'profiles' table
        console.log("🔍 Verificando tabela 'profiles'...");
        const { data: profiles, error: dbError } = await supabase.from('profiles').select('*').limit(1);

        if (dbError) {
            if (dbError.code === '42P01') { // undefined_table
                console.error("❌ Tabela 'profiles' NÃO ENCONTRADA.");
                console.log("⚠️ O banco de dados parece estar vazio. Você precisa rodar o script SQL de criação.");
            } else {
                console.error("❌ Erro ao acessar banco de dados:", dbError.message);
            }
        } else {
            console.log("✅ Tabela 'profiles': ONLINE (Conexão com Banco OK)");
            console.log("🎉 Tudo pronto para uso!");
        }

    } catch (e) {
        console.error("❌ Exceção inesperada:", e);
    }
}

check();
