import { v4 as uuidv4 } from 'uuid';
import { API_URL } from '../constants';
// import { SyncService } from '../src/services/SyncService'; // REMOVED DEPENDENCY
import { dbService } from '../src/services/DatabaseService'; // Import dbService

// Tipagem das ações offline
export type OfflineAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncItem {
    id: string; // ID único da operação para evitar duplicatas
    table: string;
    action: OfflineAction;
    payload: any; // Dados a serem inseridos/atualizados
    match?: any; // Para UPDATE/DELETE: { id: 123 }
    timestamp: number;
    status: 'PENDING' | 'SYNCING' | 'FAILED';
    retryCount: number;
}

const STORAGE_KEY = 'gmsystems_offline_queue';

class OfflineSyncManager {
    private queue: SyncItem[] = [];
    private isOnline: boolean = navigator.onLine;
    private isSyncing: boolean = false;
    private listeners: ((isOnline: boolean, syncCount: number) => void)[] = [];

    constructor() {
        this.loadQueue();
        this.setupNetworkListeners();
        // Tenta sincronizar ao iniciar se estiver online
        if (this.isOnline) {
            this.processQueue();
        }
    }

    private loadQueue() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.queue = JSON.parse(stored);
            } catch (e) {
                console.error("Falha ao carregar fila offline:", e);
                this.queue = [];
            }
        }
    }

    private saveQueue() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
        this.notifyListeners();
    }

    private setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log("Conexão restaurada. Iniciando sincronização (Mock)...");
            this.processQueue();
            this.notifyListeners();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log("Conexão perdida. Modo Offline Ativado.");
            this.notifyListeners();
        });
    }

    public subscribe(listener: (isOnline: boolean, syncCount: number) => void) {
        this.listeners.push(listener);
        // Notifica estado atual imediatamente
        listener(this.isOnline, this.queue.length);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.isOnline, this.queue.length));
    }

    // --- PERSISTÊNCIA LOCAL (SQLite) ---
    private async persistToLocalDB(table: string, action: OfflineAction, payload: any) {
        try {
            if (table === 'assets') {
                // 1. Mapeamento Inicial (Campos conhecidos)
                const dbObj: any = {
                    id: payload.id,
                    nome: payload.name,
                    categoria: payload.category,
                    estado_conservacao: payload.state,
                    localizacao_id: payload.locationId,
                    responsavel_id: payload.responsibleId,
                    data_aquisicao: payload.purchaseDate,
                    valor_aquisicao: payload.value,
                    descricao: payload.description,
                    codigo_patrimonio: payload.plate || payload.serialNumber || payload.id,
                    modelo: payload.model,
                    fabricante: payload.manufacturer || payload.brand,
                    numero_serie: payload.serialNumber,
                    url_imagem: payload.image || payload.imageUrl
                };

                // 2. Processamento Dinâmico de Campos Extras
                const knownKeys = ['id', 'name', 'category', 'state', 'locationId', 'responsibleId', 'purchaseDate', 'value', 'description', 'plate', 'serialNumber', 'model', 'manufacturer', 'brand', 'image', 'imageUrl'];
                const technicalData: any = {};

                // Itera sobre chaves desconhecidas
                for (const key of Object.keys(payload)) {
                    if (!knownKeys.includes(key)) {
                        // Sanitiza nome da coluna: apenas letras, números e underline
                        const cleanCol = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

                        // Se for primitivo (string/number), vira coluna real. Se for obj/array, vai pro JSON technical_data
                        if (typeof payload[key] !== 'object' && cleanCol.length > 0) {
                            await dbService.ensureColumnExists('assets', cleanCol);
                            dbObj[cleanCol] = payload[key]; // Adiciona ao objeto para salvar na coluna
                        } else {
                            technicalData[key] = payload[key]; // Objetos complexos continuam no JSON
                        }
                    }
                }

                // Adiciona o technical_data restante
                dbObj['technical_data'] = JSON.stringify(technicalData);

                // 3. Construção Dinâmica da Query SQL
                const columns = Object.keys(dbObj);
                const values = Object.values(dbObj).map(v => {
                    if (v === null || v === undefined) return "''";
                    const strVal = String(v).replace(/'/g, "''"); // Escape single quotes
                    return `'${strVal}'`; // Wrap in quotes
                });

                if (action === 'INSERT') {
                    const sql = `INSERT OR REPLACE INTO assets (${columns.join(', ')}) VALUES (${values.join(', ')})`;
                    console.log('💾 Saving to SQLite:', sql);
                    await dbService.execute(sql);
                } else if (action === 'UPDATE') {
                    const updates = columns.map(col => {
                        const val = dbObj[col];
                        const strVal = (val === null || val === undefined) ? "''" : `'${String(val).replace(/'/g, "''")}'`;
                        return `${col}=${strVal}`;
                    }).join(', ');

                    const sql = `UPDATE assets SET ${updates} WHERE id='${dbObj.id}'`;
                    console.log('💾 Updating SQLite:', sql);
                    await dbService.execute(sql);
                } else if (action === 'DELETE') {
                    await dbService.execute(`DELETE FROM assets WHERE id='${payload.id}'`);
                }
            } else if (table === 'locations') {
                const dbObj = {
                    id: payload.id,
                    nome: payload.name,
                    endereco: payload.address,
                    parent_id: payload.parentId
                };

                if (action === 'INSERT') {
                    await dbService.execute(`
                        INSERT OR REPLACE INTO locations (id, nome, endereco, parent_id)
                        VALUES ('${dbObj.id}', '${dbObj.nome || ''}', '${dbObj.endereco || ''}', '${dbObj.parent_id || ''}')
                    `);
                } else if (action === 'UPDATE') {
                    await dbService.execute(`
                        UPDATE locations SET 
                        nome='${dbObj.nome || ''}', 
                        endereco='${dbObj.endereco || ''}', 
                        parent_id='${dbObj.parent_id || ''}'
                        WHERE id='${dbObj.id}'
                    `);
                } else if (action === 'DELETE') {
                    await dbService.execute(`DELETE FROM locations WHERE id='${payload.id}'`);
                }
            } else if (table === 'users') {
                // Users Local Persistence
                const dbObj = {
                    id: payload.id,
                    nome: payload.name,
                    email: payload.email,
                    avatar_url: payload.avatarUrl || payload.avatar_url,
                    role: payload.role
                };

                if (action === 'UPDATE') {
                    await dbService.execute(`
                         UPDATE users SET 
                         nome='${dbObj.nome || ''}', 
                         avatar_url='${dbObj.avatar_url || ''}'
                         WHERE id='${dbObj.id}'
                     `);
                }
            }
            // Adicionar suporte a Locations e Users conforme necessário
        } catch (e) {
            console.error("Erro ao persistir no SQLite Local:", e);
        }
    }

    // Método principal para executar operações
    public async execute(table: string, action: OfflineAction, payload: any, match?: any): Promise<{ success: boolean; data?: any; error?: any; offline?: boolean }> {

        // 1. Persistir Localmente PRIMEIRO (Garante que refresh não perca dados)
        await this.persistToLocalDB(table, action, payload);

        // Se estiver online e a fila estiver vazia, tenta direto
        if (this.isOnline && this.queue.length === 0) {
            try {
                // Tenta enviar diretamente para o backend
                console.log(`[ONLINE] Executing ${action} on ${table}`, payload);

                // TIDB PROXY SYNC (Global Serverless)
                console.log(`[ONLINE] Executing ${action} on ${table} via PROXY`, payload);

                if (action) {
                    const opPayload = {
                        action,
                        table,
                        payload: { ...payload, client_id: undefined },
                        match: match || (payload.id ? { id: payload.id } : {})
                    };

                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_URL}/assets/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ operations: [opPayload] })
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            alert("SESSÃO EXPIRADA 🔒\n\nPor segurança, faça login novamente para salvar seus dados na nuvem.");
                            throw new Error("Auth Failed 401");
                        }
                        const err = await response.json();
                        throw new Error(err.error || 'Sync Failed');
                    }
                }

                return { success: true, data: [payload] };
            } catch (error) {
                console.error("Erro ao executar online (fallback para fila):", error);
                // Se falhar, cai no fluxo abaixo e adiciona na fila
            }
        }

        // Se offline ou falhou o online, adiciona na fila
        const item: SyncItem = {
            id: uuidv4(),
            table,
            action,
            payload,
            match: match || (payload.id ? { id: payload.id } : {}),
            timestamp: Date.now(),
            status: 'PENDING',
            retryCount: 0
        };

        this.queue.push(item);
        this.saveQueue();

        this.saveQueue();

        console.log(`Operação offline agendada: ${action} em ${table}`);
        return { success: true, offline: true };
    }

    public async processQueue(force: boolean = false) {
        if (this.isSyncing) return;
        if (this.queue.length === 0) return;
        if (!this.isOnline && !force) {
            console.warn("⏹️ [SYNC SKIPPED] Offline & Not Forced.");
            return;
        }

        console.log(force ? "🔥 [SYNC FORCED] Ignoring Network Status check..." : "🔄 [SYNC AUTO] Network Status OK.");

        this.isSyncing = true;
        this.notifyListeners();

        console.log("🟦 [SYNC START] Processing queue...", this.queue.length, "items");

        const remainingQueue: SyncItem[] = [];
        let successCount = 0;
        let failCount = 0;

        try {
            for (const item of this.queue) {
                console.log(`🔷 [SYNC ITEM] Processing ${item.action} on ${item.table} (ID: ${item.id})`);
                console.log(`📦 [SYNC PAYLOAD]`, item.payload);

                // Skip if retry count exceeded (Poison Pill Prevention)
                if (item.retryCount > 5) {
                    console.error(`🟥 [SYNC POISON] Discarding item ${item.id} after 5 failed attempts.`);
                    failCount++;
                    continue;
                }

                const opPayload = {
                    action: item.action,
                    table: item.table,
                    payload: item.payload,
                    match: item.match
                };

                const token = localStorage.getItem('auth_token');
                if (!token) {
                    console.error(`🟥 [SYNC AUTH] No token found in localStorage!`);
                    remainingQueue.push(item);
                    break; // Stop sync if no token
                }

                try {
                    console.log(`🚀 [SYNC FETCH] Sending to ${API_URL}/assets/sync...`);
                    const response = await fetch(`${API_URL}/assets/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ operations: [opPayload] })
                    });

                    console.log(`📡 [SYNC RESPONSE] Status: ${response.status}`);

                    if (!response.ok) {
                        const status = response.status;
                        const errText = await response.text();
                        console.error(`🟥 [SYNC ERROR] Server returned ${status}: ${errText}`);

                        if (status === 401) {
                            console.warn("🔒 [SYNC AUTH] Token Expired/Invalid. Stopping sync.");
                            remainingQueue.push(item);
                            const currentIndex = this.queue.indexOf(item);
                            if (currentIndex !== -1) remainingQueue.push(...this.queue.slice(currentIndex + 1));
                            break;
                        }

                        // 4xx Errors (Bad Request) -> Discard Item
                        if (status >= 400 && status < 500) {
                            console.error(`🗑️ [SYNC DISCARD] discard item (4xx).`);
                            continue; // Drop item
                        }

                        throw new Error(`Server Error ${status}: ${errText}`);
                    }

                    const json = await response.json();
                    console.log(`✅ [SYNC SUCCESS] Response:`, json);
                    successCount++;

                } catch (fetchError: any) {
                    console.error(`🟥 [SYNC NETWORK ERROR]`, fetchError);
                    item.retryCount = (item.retryCount || 0) + 1;
                    remainingQueue.push(item);
                    failCount++;
                }
            }

            this.queue = remainingQueue;
            this.saveQueue();
            console.log(`🏁 [SYNC FINISH] Success: ${successCount}, Failed/Skipped: ${failCount}, Remaining: ${this.queue.length}`);

        } catch (error) {
            console.error("[SYNC CRITICAL]", error);
        } finally {
            this.isSyncing = false;
            this.notifyListeners();
        }
    }

    public getQueueLength() {
        return this.queue.length;
    }

    public isNetworkOnline() {
        return this.isOnline;
    }
}

export const offlineSync = new OfflineSyncManager();
