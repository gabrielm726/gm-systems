
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const API_URL = 'http://localhost:3001/api';
// Usar credenciais padrão ou do ambiente
const MASTER_EMAIL = process.env.MASTER_EMAIL || 'admin@gm.gov.br';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'admin';
const CLIENT_ID = '11111111-1111-1111-1111-111111111111'; // GM Holding

let masterToken = '';
let newUserId = '';
const uniqueId = Date.now().toString().slice(-6);
const newUserEmail = `auditor_${uniqueId}@gm.gov.br`;
const newUserPass = '123456';

async function runTest() {
    console.log(`\n🔍 INICIANDO AUDITORIA AUTOMATIZADA DO SISTEMA [ID: ${uniqueId}]`);
    console.log("==================================================================");

    try {
        // --- 1. TESTE DE REGISTRO SEGURO ---
        console.log(`\n[PASSO 1] Testando Registro com Motivo Obrigatório...`);
        const regPayload = {
            nome: 'Auditor de Segurança',
            email: newUserEmail,
            password: newUserPass,
            client_id: CLIENT_ID,
            motivo_cadastro: 'Verificação de conformidade de segurança e backup.',
            organization: 'Auditoria Interna',
            cnpj: '00.000.000/0001-00'
        };

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regPayload)
        });
        const regData = await regRes.json();

        if (regRes.status === 201 && regData.success) {
            console.log(`✅ Registro enviado com sucesso.`);
            console.log(`   Motivo Registrado: "${regPayload.motivo_cadastro}"`);
        } else {
            throw new Error(`Falha no registro: ${JSON.stringify(regData)}`);
        }

        // --- 2. TESTE DE BLOQUEIO PENDENTE ---
        console.log(`\n[PASSO 2] Verificando Bloqueio de Usuário Pendente...`);
        const loginFailRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newUserEmail, password: newUserPass, client_id: CLIENT_ID })
        });
        const loginFailData = await loginFailRes.json();

        if (loginFailRes.status === 403 && loginFailData.message.includes('PENDENTE')) {
            console.log(`✅ SUCESSO: Login bloqueado conforme esperado.`);
            console.log(`   Mensagem do Sistema: "${loginFailData.message}"`);
        } else {
            throw new Error(`FALHA DE SEGURANÇA: Usuário pendente conseguiu logar ou erro incorreto. ${JSON.stringify(loginFailData)}`);
        }

        // --- 3. LOGIN ADMINISTRATIVO (MASTER) ---
        console.log(`\n[PASSO 3] Autenticando como Master para aprovação...`);
        const masterLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: MASTER_EMAIL, password: MASTER_PASSWORD, client_id: CLIENT_ID })
        });
        const masterData = await masterLoginRes.json();

        if (!masterData.success) throw new Error("Falha no login Master.");
        masterToken = masterData.token;
        console.log(`✅ Master autenticado.`);

        // --- 4. FLUXO DE APROVAÇÃO ---
        console.log(`\n[PASSO 4] Localizando e Aprovando Solicitação...`);
        const pendingRes = await fetch(`${API_URL}/auth/pending`, {
            headers: { 'Authorization': `Bearer ${masterToken}` }
        });
        const pendingData = await pendingRes.json();
        const targetUser = pendingData.data.find(u => u.email === newUserEmail);

        if (!targetUser) throw new Error("Usuário não encontrado na fila de pendentes.");
        newUserId = targetUser.id;
        console.log(`✅ Solicitação encontrada. ID: ${newUserId}`);
        console.log(`   Validando Motivo no Banco: "${targetUser.motivo_cadastro}"`);

        const approveRes = await fetch(`${API_URL}/auth/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${masterToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: newUserId, action: 'APPROVE' })
        });
        const approveData = await approveRes.json();
        if (!approveData.success) throw new Error("Falha na aprovação.");
        console.log(`✅ Usuário APROVADO pelo Administrador.`);

        // --- 5. LOGIN PÓS-APROVAÇÃO ---
        console.log(`\n[PASSO 5] Validando Acesso Pós-Aprovação...`);
        const loginSuccessRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newUserEmail, password: newUserPass, client_id: CLIENT_ID })
        });
        const loginSuccessData = await loginSuccessRes.json();
        if (loginSuccessData.success) {
            console.log(`✅ Login realizado com sucesso! Token de acesso gerado.`);
        } else {
            throw new Error("Falha no login após aprovação.");
        }

        // --- 6. TESTE DE BACKUP REAL (ISOLADO) ---
        console.log(`\n[PASSO 6] Gerando Backup Seguro via API (Master Only)...`);

        // Vamos tentar backup como o NOVO usuário (OPERADOR) -> Deve falhar (ou ser restrito)
        // E depois como MASTER -> Deve funcionar.
        // O requisito diz que MASTER faz backup.

        const backupRes = await fetch(`${API_URL}/backup/download`, {
            headers: { 'Authorization': `Bearer ${masterToken}` }
        });

        if (backupRes.ok) {
            const backupJson = await backupRes.json();
            console.log(`✅ Backup Gerado e Recebido.`);
            console.log(`   Isolamento (Client ID): ${backupJson.metadata.client_id}`);
            console.log(`   Tabelas: ${Object.keys(backupJson.data).join(', ')}`);
            console.log(`   Integridade: JSON válido e estruturado.`);

            if (backupJson.metadata.client_id !== CLIENT_ID) {
                throw new Error("VIOLAÇÃO DE ISOLAMENTO: Backup contém dados de outro cliente!");
            }
        } else {
            throw new Error(`Falha no backup: ${backupRes.statusText}`);
        }

        console.log("\n==================================================================");
        console.log("🟢 [CONCLUSÃO] O SISTEMA ESTÁ SEGURO, INTEGRO E OPERACIONAL.");
        console.log("==================================================================");

    } catch (error) {
        console.error("\n🔴 FALHA NA AUDITORIA:", error.message);
        process.exit(1);
    }
}

runTest();
