import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const logDebug = (msg, data) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${msg} ${data ? JSON.stringify(data) : ''}`;

    // Vercel/Cloud Environment: Use Console (Stdout)
    console.log(logMessage);

    // Optional: Keep file logging ONLY if running locally (not in Vercel)
    if (!process.env.VERCEL) {
        try {
            const logPath = path.join(process.cwd(), 'debug.log');
            fs.appendFileSync(logPath, logMessage + '\n');
        } catch (e) {
            console.error("Falha ao escrever log local:", e);
        }
    }
};

// LIST ASSETS (GET /api/assets)
export const listAssets = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM assets WHERE client_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
            [req.user.client_id]
        );

        // Buscar unidades (locations) para não quebrar a tela de cadastro
        const [locationsRows] = await pool.query(
            'SELECT * FROM locations WHERE client_id = ? AND is_deleted = 0',
            [req.user.client_id]
        );

        const locations = locationsRows.map(l => ({
            id: l.id,
            name: l.nome,
            address: l.endereco,
            parentId: l.parent_id,
            type: 'BUILDING'
        }));

        // Mapeia do Banco (Snake) para Frontend (Camel)
        const assets = rows.map(row => ({
            id: row.id,
            name: row.name, // address name column
            category: row.categoria,
            state: row.status, // Mapped status -> state
            locationId: row.location_id, // address location_id column
            value: Number(row.value), // address value column
            purchaseDate: row.data_aquisicao,
            description: row.description || row.descricao, // trying both just in case
            imageUrl: row.url_imagem,
            createdAt: row.created_at,
            manufacturer: row.fabricante,
            model: row.modelo,
            serialNumber: row.numero_serie,
            // Tenta parsear dados técnicos se existirem
            ...(row.technical_data ? JSON.parse(row.technical_data) : {})
        }));

        res.json({
            status: 'success',
            data: { assets, locations }
        });
    } catch (error) {
        console.error('Erro ao listar ativos:', error);
        res.status(500).json({ status: 'error', message: 'Erro interno no servidor' });
    }
};

// CREATE ASSET (POST /api/assets)
export const createAsset = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { name, category, state, locationId, value, manufacturer, model, serialNumber, imageUrl } = req.body;

        // Validação Mínima
        if (!name) return res.status(400).json({ status: 'error', message: 'Nome do ativo é obrigatório' });

        const id = uuidv4();
        const client_id = req.user.client_id;
        const now = new Date(); // Timestamp para retorno imediato

        // Mapeamento para o Banco
        // CONFIRMED SCHEMA: id, client_id, name, description, value, status, location_id, ...
        // fabricante, modelo, numero_serie, url_imagem, categoria
        // MISSING: estado_conservacao -> MAPPING TO 'status'
        const sql = `
            INSERT INTO assets (
                id, client_id, name, categoria, status, 
                location_id, value, fabricante, modelo, 
                numero_serie, url_imagem, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            id, client_id, name, category || 'OUTROS', state || 'BOM',
            locationId || null, value || 0, manufacturer || null, model || null,
            serialNumber || null, imageUrl || null, now, now
        ];

        await connection.execute(sql, values);

        // Retorna o objeto completo formatado para o frontend (CamelCase)
        const newAsset = {
            id,
            name,
            category,
            state,
            locationId,
            value,
            manufacturer,
            model,
            serialNumber,
            imageUrl,
            createdAt: now.toISOString()
        };

        res.status(201).json(newAsset);

    } catch (error) {
        console.error('Erro ao criar ativo:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao criar ativo: ' + error.message });
    } finally {
        connection.release();
    }
};

// KEEPING EXISTING GETASSETS FOR BACKWARD COMPATIBILITY IF NEEDED, BUT RENAMING OR REMOVING IF UNUSED. 
// User asked to "Show existing". I will replace it completely since I am rewriting specific requested functions.
// Actually, looking at the previous file content, getAssets was doing a combined fetch of assets and locations.
// The user asked specifically for `createAsset` and `listAssets`.
// I will keep `getAssets` as legacy or replace it if it conflicts. 
// Since I am replacing the existing `getAssets` block, I'm effectively redefining it.
// Wait, the user asked for `listAssets` specifically. I will export `listAssets` and `createAsset`.
// I'll leave the helper functions below untouched.


// Helper de Mapeamento (Frontend CamelCase -> Backend SnakeCase for Cloud DB)
const mapPayloadToDb = (table, payload) => {
    const mapped = { ...payload };

    // Standard Mapping (Camel -> Snake)
    // Note: Cloud DB uses English for core fields (name, description) but Portuguese for legacy fields.

    if (table === 'assets') {
        // Core Fields (Keep English as per Cloud DB Schema)
        // name -> name
        // description -> description
        // value -> value
        // status -> status

        // Snake Case Conversions
        if ('locationId' in mapped) { mapped.location_id = mapped.locationId; delete mapped.locationId; }

        // Portuguese Legacy Fields (Cloud DB Schema)
        if ('category' in mapped) { mapped.categoria = mapped.category; delete mapped.category; }
        if ('state' in mapped) { mapped.estado_conservacao = mapped.state; delete mapped.state; }
        if ('responsibleId' in mapped) { mapped.responsavel_id = mapped.responsibleId; delete mapped.responsibleId; }
        if ('purchaseDate' in mapped) { mapped.data_aquisicao = mapped.purchaseDate; delete mapped.purchaseDate; }
        if ('imageUrl' in mapped) { mapped.url_imagem = mapped.imageUrl; delete mapped.imageUrl; }
        if ('image' in mapped) { delete mapped.image; }

        // Serial Number Logic
        if ('serialNumber' in mapped && !mapped.codigo_patrimonio) {
            mapped.codigo_patrimonio = mapped.serialNumber;
            delete mapped.serialNumber;
        } else if ('serialNumber' in mapped) {
            delete mapped.serialNumber;
        }

    } else if (table === 'locations') {
        // Locations DB: id, client_id, name, address, created_at
        // Frontend sends: name, address, parentId

        // name -> name (Keep)
        // address -> address (Keep)

        if ('parentId' in mapped) { mapped.parent_id = mapped.parentId; delete mapped.parentId; }

    } else if (table === 'users') {
        // Users DB: id, nome, email, avatar_url, role, status
        // Frontend sends: name, email, avatarUrl, role

        // name -> nome
        if ('name' in mapped) { mapped.nome = mapped.name; delete mapped.name; }

        if ('avatarUrl' in mapped) { mapped.avatar_url = mapped.avatarUrl; delete mapped.avatarUrl; }

    } else if (table === 'suppliers') {
        // supplierType -> supplier_type
        if ('supplierType' in mapped) { mapped.supplier_type = mapped.supplierType; delete mapped.supplierType; }

    } else if (table === 'costs') {
        // supplierId -> supplier_id
        if ('supplierId' in mapped) { mapped.supplier_id = mapped.supplierId; delete mapped.supplierId; }
        // assetId -> asset_id
        if ('assetId' in mapped) { mapped.asset_id = mapped.assetId; delete mapped.assetId; }
        // invoiceNumber -> invoice_number
        if ('invoiceNumber' in mapped) { mapped.invoice_number = mapped.invoiceNumber; delete mapped.invoiceNumber; }
        // dueDate -> due_date
        if ('dueDate' in mapped) { mapped.due_date = mapped.dueDate; delete mapped.dueDate; }
        // costCenter -> cost_center
        if ('costCenter' in mapped) { mapped.cost_center = mapped.costCenter; delete mapped.costCenter; }

    } else if (table === 'movements') {
        // assetId -> asset_id
        if ('assetId' in mapped) { mapped.asset_id = mapped.assetId; delete mapped.assetId; }
        // fromLocationId -> from_location_id
        if ('fromLocationId' in mapped) { mapped.from_location_id = mapped.fromLocationId; delete mapped.fromLocationId; }
        // toLocationId -> to_location_id
        if ('toLocationId' in mapped) { mapped.to_location_id = mapped.toLocationId; delete mapped.toLocationId; }
        // requestDate -> request_date
        if ('requestDate' in mapped) { mapped.request_date = mapped.requestDate; delete mapped.requestDate; }
        // responsibleId -> responsible_id
        if ('responsibleId' in mapped) { mapped.responsible_id = mapped.responsibleId; delete mapped.responsibleId; }
        // toResponsibleId -> to_responsible_id
        if ('toResponsibleId' in mapped) { mapped.to_responsible_id = mapped.toResponsibleId; delete mapped.toResponsibleId; }
        // approvalDate -> approval_date
        if ('approvalDate' in mapped) { mapped.approval_date = mapped.approvalDate; delete mapped.approvalDate; }
        // approverId -> approver_id
        if ('approverId' in mapped) { mapped.approver_id = mapped.approverId; delete mapped.approverId; }

    } else if (table === 'inventory_sessions') {
        // startDate -> start_date
        if ('startDate' in mapped) { mapped.start_date = mapped.startDate; delete mapped.startDate; }
        // endDate -> end_date
        if ('endDate' in mapped) { mapped.end_date = mapped.endDate; delete mapped.endDate; }
        // responsibleId -> responsible_id
        if ('responsibleId' in mapped) { mapped.responsible_id = mapped.responsibleId; delete mapped.responsibleId; }
        // totalAssetsExpected -> total_assets_expected
        if ('totalAssetsExpected' in mapped) { mapped.total_assets_expected = mapped.totalAssetsExpected; delete mapped.totalAssetsExpected; }
        // totalAssetsScanned -> total_assets_scanned
        if ('totalAssetsScanned' in mapped) { mapped.total_assets_scanned = mapped.totalAssetsScanned; delete mapped.totalAssetsScanned; }
        // divergencesCount -> divergences_count
        if ('divergencesCount' in mapped) { mapped.divergences_count = mapped.divergencesCount; delete mapped.divergencesCount; }

    } else if (table === 'documents') {
        // entityType -> entity_type
        if ('entityType' in mapped) { mapped.entity_type = mapped.entityType; delete mapped.entityType; }
        // assetId -> asset_id
        if ('assetId' in mapped) { mapped.asset_id = mapped.assetId; delete mapped.assetId; }
        // responsibleId -> responsible_id
        if ('responsibleId' in mapped) { mapped.responsible_id = mapped.responsibleId; delete mapped.responsibleId; }

    } else if (table === 'official_processes') {
        // processNumber -> process_number
        if ('processNumber' in mapped) { mapped.process_number = mapped.processNumber; delete mapped.processNumber; }
    }

    // Remover campos desconhecidos/extras que o frontend envia mas o banco não tem
    const blockedKeywords = ['isPending', 'isSynced', 'maintenanceHistory', 'locationHistory', 'accounting', 'tagImageUrl'];
    blockedKeywords.forEach(k => delete mapped[k]);

    return mapped;
};

// WHITELIST DE COLUNAS DO CLOUD DB (CORRIGIDO PARA SCHEMA REAL)
const KNOWN_ASSET_COLUMNS = [
    'id', 'client_id', 'name', 'description', 'value', 'status', 'location_id',
    'created_at', 'updated_at', 'modelo', 'fabricante', 'numero_serie', 'numero_nota_fiscal',
    'url_imagem', 'url_qr_code', 'status_uso', 'categoria', 'responsavel_id', 'data_aquisicao',
    'codigo_patrimonio', 'technical_data', 'estado_conservacao', 'is_deleted'
];

const packDynamicFields = (payload) => {
    const cleanPayload = {};
    const technicalData = payload.technical_data ? JSON.parse(typeof payload.technical_data === 'string' ? payload.technical_data : JSON.stringify(payload.technical_data)) : {};

    Object.keys(payload).forEach(key => {
        if (KNOWN_ASSET_COLUMNS.includes(key)) {
            cleanPayload[key] = payload[key];
        } else {
            // Se não é coluna conhecida, move para technical_data
            technicalData[key] = payload[key];
        }
    });

    // Atualiza technical_data com os novos campos mesclados
    cleanPayload.technical_data = JSON.stringify(technicalData);

    return cleanPayload;
};

export const syncBatch = async (req, res) => {
    logDebug('SYNC REQUEST RECEIVED', { body: req.body, user: req.user });
    const connection = await pool.getConnection(); // Changed db.getConnection() to pool.getConnection()
    await connection.beginTransaction();

    try {
        const { operations } = req.body;

        if (!process.env.DB_PASSWORD && process.env.NODE_ENV !== 'development') {
            // Just a sanity check log
            logDebug('WARNING: Running without DB Password');
        }

        if (!operations || !Array.isArray(operations)) {
            logDebug('INVALID PAYLOAD', operations);
            throw new Error("Payload inválido. 'operations' deve ser um array.");
        }

        // 0. ORDENAR OPERAÇÕES POR DEPENDÊNCIA
        // Locations devem vir antes de Assets para garantir que FKs existam
        operations.sort((a, b) => {
            const priority = { 'locations': 1, 'assets': 2, 'inventory_sessions': 3 };
            return (priority[a.table] || 99) - (priority[b.table] || 99);
        });

        logDebug(`Processing ${operations.length} operations for client ${req.user.client_id} (Sorted)`);

        const results = [];
        const errors = [];

        for (const op of operations) {
            try {
                const { action, table, payload, match } = op;

                // VALIDAR TABELA (Segurança simples)
                const allowedTables = ['assets', 'locations', 'inventory_sessions', 'users', 'suppliers', 'costs', 'documents', 'movements', 'legal_norms', 'official_processes'];
                if (!allowedTables.includes(table)) {
                    throw new Error(`Tabela não permitida: ${table}`);
                }

                logDebug(`Executing ${action} on ${table}`, payload);

                if (action === 'INSERT') {
                    // 1. Injeta Client ID (SNAKE CASE from authMiddleware)
                    let dbPayload = { ...payload, client_id: req.user.client_id };

                    // 2. Mapeia Campos
                    dbPayload = mapPayloadToDb(table, dbPayload);

                    // 2.1 Pack Dynamic Fields (Assets Only)
                    if (table === 'assets') {
                        dbPayload = packDynamicFields(dbPayload);
                    }

                    // 3. Remover undefined -> null (MySQL2 Crash Protection)
                    Object.keys(dbPayload).forEach(key => {
                        if (dbPayload[key] === undefined) dbPayload[key] = null;
                    });

                    // Formata colunas e valores
                    const generateInsertSQL = (obj) => {
                        const keys = Object.keys(obj);
                        const placeholders = keys.map(() => '?').join(', ');
                        return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
                    };

                    try {
                        let sql = generateInsertSQL(dbPayload);
                        await connection.execute(sql, Object.values(dbPayload));
                    } catch (insertError) {
                        // AUTO-HEALING: ERRO DE FK (1452)
                        // Se tentou inserir um ativo com localização que não existe, tenta sem localização.
                        if (insertError.errno === 1452 && table === 'assets' && dbPayload.localizacao_id) {
                            logDebug(`FK Error on ${op.id}. Retrying with localizacao_id = NULL`);
                            dbPayload.localizacao_id = null;
                            const sqlRetry = generateInsertSQL(dbPayload);
                            await connection.execute(sqlRetry, Object.values(dbPayload));
                            // Sucesso no retry
                        } else {
                            throw insertError; // Re-throw se não for erro de FK recuperável
                        }
                    }

                    results.push({ id: op.id, status: 'SUCCESS' });

                } else if (action === 'UPDATE') {
                    if (!match || !match.id) throw new Error("UPDATE requer 'match.id'");

                    let dbPayload = { ...payload };
                    delete dbPayload.id; // Não atualiza ID
                    delete dbPayload.client_id; // Não muda dono

                    // Mapeia
                    dbPayload = mapPayloadToDb(table, dbPayload);

                    // Pack Dynamic Fields (Assets Only)
                    if (table === 'assets') {
                        dbPayload = packDynamicFields(dbPayload);
                    }

                    // Undefined -> Null
                    Object.keys(dbPayload).forEach(key => {
                        if (dbPayload[key] === undefined) dbPayload[key] = null;
                    });

                    const keys = Object.keys(dbPayload);
                    if (keys.length > 0) {
                        const setClause = keys.map(k => `${k} = ?`).join(', ');
                        const sql = `UPDATE ${table} SET ${setClause} WHERE id = ? AND client_id = ?`;

                        try {
                            await connection.execute(sql, [...Object.values(dbPayload), match.id, req.user.client_id]);
                        } catch (updateError) {
                            if (updateError.errno === 1452 && table === 'assets' && dbPayload.localizacao_id) {
                                logDebug(`FK Error on UPDATE ${op.id}. Retrying with localizacao_id = NULL`);
                                // Remove localizacao_id do set clause e tenta de novo (ou define como null explicitamente?)
                                // Melhor definir update para NULL
                                const retryPayload = { ...dbPayload, localizacao_id: null };
                                const retryKeys = Object.keys(retryPayload);
                                const retrySetClause = retryKeys.map(k => `${k} = ?`).join(', ');
                                const retrySql = `UPDATE ${table} SET ${retrySetClause} WHERE id = ? AND client_id = ?`;
                                await connection.execute(retrySql, [...Object.values(retryPayload), match.id, req.user.client_id]);
                            } else {
                                throw updateError;
                            }
                        }
                    }
                    results.push({ id: op.id, status: 'SUCCESS' });

                } else if (action === 'DELETE') {
                    if (!match || !match.id) throw new Error("DELETE requer 'match.id'");

                    // SOFT DELETE
                    const sql = `UPDATE ${table} SET is_deleted = 1 WHERE id = ? AND client_id = ?`;
                    await connection.execute(sql, [match.id, req.user.client_id]);
                    results.push({ id: op.id, status: 'SUCCESS' });
                }

            } catch (opError) {
                console.error(`Erro na operação ${op.id}:`, opError);
                logDebug(`OP ERROR: ${op.id}`, opError.message);
                errors.push({ id: op.id, error: opError.message });
            }
        }

        await connection.commit();
        logDebug('SYNC COMPLETED', { results, errors });

        res.status(200).json({
            success: true,
            processed: results.length,
            errors: errors.length,
            details: { results, errors }
        });

    } catch (error) {
        await connection.rollback();
        console.error("Erro no Sync Batch:", error);
        logDebug('SYNC FATAL ERROR', error.message);
        res.status(500).json({ success: false, message: 'Erro ao processar sincronização.', error: error.message });
    } finally {
        connection.release();
    }
};
