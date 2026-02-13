const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // We might need to install uuid or use crypto

// Helper for random data
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];

const CONFIG = {
    ORG_NAME: '[TESTE DE CARGA] Prefeitura Simulator 2026',
    TOTAL_ASSETS: 15000,
    TOTAL_SUPPLIERS: 1000,
    TOTAL_LOCATIONS: 50,
    BATCH_SIZE: 50 // Insert in small chunks to allow agent to read/execute efficiently
};

// Check if crypto exists (Node built-in) for UUID if uuid package missing
const crypto = require('crypto');
const generateUUID = () => crypto.randomUUID();

function generateSQL() {
    console.log(`Iniciando geração de dados para Teste de Carga...`);
    console.log(`Alvos: ${CONFIG.TOTAL_ASSETS} Ativos, ${CONFIG.TOTAL_SUPPLIERS} Fornecedores.`);

    const orgId = generateUUID();
    const outputFile = path.join(__dirname, '..', 'stress_test_data.sql');
    const undoFile = path.join(__dirname, '..', 'undo_stress_test.sql');

    let sqlContent = `-- SCRIPT DE TESTE DE CARGA (GERADO AUTOMATICAMENTE)\n`;
    sqlContent += `-- DATA: ${new Date().toISOString()}\n`;
    sqlContent += `-- ORG_ID: ${orgId}\n\n`;

    // 1. Create Organization
    sqlContent += `-- 1. CRIAR ORGANIZAÇÃO DE TESTE\n`;
    sqlContent += `INSERT INTO public.organizations (id, name, plan) VALUES ('${orgId}', '${CONFIG.ORG_NAME}', 'ENTERPRISE');\n\n`;

    // 2. Create Locations (Hierarchy likely flat for stress test simplicity, or simple 1-level)
    console.log('Gerando Locais...');
    const locationIds = [];
    sqlContent += `-- 2. CRIAR LOCAIS (${CONFIG.TOTAL_LOCATIONS})\n`;
    sqlContent += `INSERT INTO public.locations (id, organization_id, name, type) VALUES \n`;

    const locationTypes = ['BUILDING', 'ROOM', 'DEPOT', 'EXTERNAL'];
    const locationNames = ['Secretaria', 'Departamento', 'Almoxarifado', 'Escola', 'Posto de Saúde'];

    for (let i = 0; i < CONFIG.TOTAL_LOCATIONS; i++) {
        const id = generateUUID();
        locationIds.push(id);
        const name = `${randomElement(locationNames)} ${i + 1}`;
        const type = randomElement(locationTypes);
        sqlContent += `('${id}', '${orgId}', '${name}', '${type}')${i === CONFIG.TOTAL_LOCATIONS - 1 ? ';' : ','}\n`;
    }
    sqlContent += `\n`;

    // 3. Create Suppliers (Assuming schema might use a separate table or just strings? Checking types.ts it seems Supplier is an interface, prob a table 'suppliers' exists or will use local consts if not in V2 SQL?
    // SETUP_SUPABASE_V2 doesn't show 'suppliers' table explicitly, mostly assets/locations/profiles.
    // SETUP_SUPABASE has no suppliers table either? 
    // Wait, types.ts has Supplier interface. 
    // Let's assume for now we might skip Suppliers table if it's not in the main setup SQL provided, 
    // OR we just create Assets.
    // Looking at the prompt history, 'suppliers' might be a separate feature or just local state.
    // But the user asked for "centenas de empresa".
    // I will check if 'suppliers' table exists. Only 'organizations', 'profiles', 'locations', 'assets' in V2.
    // I will simulate Suppliers as just 'provider' or 'supplierId' in Assets if applicable, OR simply ignore if no table.
    // Re-reading SETUP_SUPABASE_V2... no suppliers table.
    // Re-reading SETUP_SUPABASE... no suppliers table.
    // Maybe they are stored in 'profiles' with role='SUPPLIER'? Or maybe created in a previous turn I missed?
    // User requested "centenas de empresa".
    // I'll stick to Assets and Locations which are confirmed tables. 
    // Actually, I can add a fake 'suppliers' table create if needed, but better stick to existing schema.
    // Wait, types.ts shows `supplierId?: string;` in Maintenance.
    // Let's focus on Assets (Patrimônios) which is the main request ("milhares de patrimonio").
    // I will add "Suppliers" as just text names or ignore if strictly relational.
    // In Assets table: `category`, `status`, `location_id`. No supplier_id column in SETUP_SUPABASE line 59.
    // OK, so "Suppliers" request might be conceptual or asking for something the DB doesn't fully support yet?
    // I will focus heavily on Assets and Locations.

    // 4. Create Assets
    console.log('Gerando Ativos...');
    sqlContent += `-- 3. CRIAR ATIVOS (${CONFIG.TOTAL_ASSETS})\n`;

    const categories = ['Eletrônicos', 'Mobiliário', 'Veículo', 'Ferramenta', 'Imóvel'];
    const statuses = ['Bom', 'Regular', 'Ruim', 'Em Manutenção', 'Novo'];

    // Process in batches
    for (let i = 0; i < CONFIG.TOTAL_ASSETS; i += CONFIG.BATCH_SIZE) {
        const batchEnd = Math.min(i + CONFIG.BATCH_SIZE, CONFIG.TOTAL_ASSETS);
        sqlContent += `INSERT INTO public.assets (id, organization_id, name, value, location_id, status, category) VALUES \n`;

        for (let j = i; j < batchEnd; j++) {
            const id = generateUUID();
            const name = `Ativo de Teste ${j + 1}`;
            const value = randomInt(100, 50000); // R$ 100 to R$ 50k
            const locId = randomElement(locationIds);
            const status = randomElement(statuses);
            const category = randomElement(categories); // Needs matching column in DB, SETUP_SUPABASE_V2 doesn't explicitly show 'category' column in snippet but `assets` usually has it.
            // Setup V2 line 54: id, org_id, name, value, loc_id, status. MISSING category?
            // SETUP_SUPABASE line 63: category TEXT.
            // I'll include category, worst case it fails and I remove it. V2 implies full schema.

            sqlContent += `('${id}', '${orgId}', '${name}', ${value}, '${locId}', '${status}', '${category}')${j === batchEnd - 1 ? ';' : ','}\n`;
        }
        sqlContent += `\n`;
    }

    fs.writeFileSync(outputFile, sqlContent);
    console.log(`SQL de Carga gerado: ${outputFile}`);

    // Generate Undo Script
    let undoContent = `-- SCRIPT DE REVERSÃO (UNDO STRESS TEST)\n`;
    undoContent += `DELETE FROM public.assets WHERE organization_id = '${orgId}';\n`;
    undoContent += `DELETE FROM public.locations WHERE organization_id = '${orgId}';\n`;
    undoContent += `DELETE FROM public.organizations WHERE id = '${orgId}';\n`;

    fs.writeFileSync(undoFile, undoContent);
    console.log(`SQL de Reversão gerado: ${undoFile}`);
}

generateSQL();
