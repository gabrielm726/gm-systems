import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { LOCAL_SCHEMA } from '../database/schema';

class DatabaseService {
    private sqlite: SQLiteConnection;
    private db: SQLiteDBConnection | null = null;
    private dbName: string = 'gm_systems_local.db';

    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    async initialize(): Promise<void> {
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'web') {
                console.log('🌐 Running on Web - Initializing JeepSQLite...');
                const jeepEl = document.createElement('jeep-sqlite');
                document.body.appendChild(jeepEl);
                await customElements.whenDefined('jeep-sqlite');
                await this.sqlite.initWebStore();
            }

            // Cria conexão
            this.db = await this.sqlite.createConnection(
                this.dbName,
                false,
                'no-encryption',
                1,
                false
            );

            // Abre conexão
            await this.db.open();
            console.log('✅ Banco Local SQLite aberto com sucesso.');

            // Cria tabelas
            await this.db.execute(LOCAL_SCHEMA);
            console.log('✅ Schema Local verificado/criado.');

            // MIGRATION: Ensure password_hash exists in user_session
            try {
                await this.db.execute("ALTER TABLE user_session ADD COLUMN password_hash TEXT;");
                console.log('✅ Coluna password_hash adicionada com sucesso.');
            } catch (e: any) {
                // Ignore
            }

            // MIGRATION: Ensure avatar_url exists in user_session (Sync Fix)
            try {
                await this.db.execute("ALTER TABLE user_session ADD COLUMN avatar_url TEXT;");
                console.log('✅ Coluna avatar_url adicionada em user_session.');
            } catch (e: any) {
                // Ignore
            }

            // MIGRATION: Ensure assets columns exist (Fix for "Disappearing Assets")
            const assetCols = [
                'codigo_patrimonio', 'responsavel_id', 'localizacao_id', 'estado_conservacao',
                'valor_aquisicao', 'data_aquisicao', 'categoria', 'descricao',
                'modelo', 'fabricante', 'numero_serie', 'url_imagem'
            ];
            for (const col of assetCols) {
                try {
                    await this.db.execute(`ALTER TABLE assets ADD COLUMN ${col} TEXT;`);
                    console.log(`✅ Coluna ${col} adicionada em assets.`);
                } catch (e) {
                    // Ignore if exists
                }
            }

            // MIGRATION: Hybrid JSON Column (The "Radical" Fix)
            try {
                await this.db.execute("ALTER TABLE assets ADD COLUMN technical_data TEXT;");
                console.log('✅ Coluna Híbrida technical_data adicionada.');
            } catch (e) {
                // Ignore
            }

        } catch (error) {
            console.error('❌ Erro ao inicializar SQLite:', error);
            throw error;
        }
    }

    async execute(sql: string): Promise<any> {
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.execute(sql);
    }

    async query(sql: string, values: any[] = []): Promise<any[]> {
        if (!this.db) throw new Error('Database not initialized');
        const result = await this.db.query(sql, values);
        return result.values || [];
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.sqlite.closeConnection(this.dbName, false);
            this.db = null;
        }
    }
    async repairSchema() {
        const assetCols = [
            'codigo_patrimonio', 'responsavel_id', 'localizacao_id', 'estado_conservacao',
            'valor_aquisicao', 'data_aquisicao', 'categoria', 'descricao',
            'modelo', 'fabricante', 'numero_serie', 'url_imagem', 'technical_data'
        ];

        let log = '';
        for (const col of assetCols) {
            try {
                await this.db.execute(`ALTER TABLE assets ADD COLUMN ${col} TEXT;`);
                log += `✅ Coluna '${col}' adicionada.\n`;
            } catch (e: any) {
                log += `ℹ️ Coluna '${col}' já existe ou erro: ${e.message}\n`;
            }
        }
        return log;
    }

    async ensureColumnExists(table: string, column: string): Promise<void> {
        if (!this.db) return;
        try {
            // Sanitize column name to prevent injection
            const cleanCol = column.replace(/[^a-zA-Z0-9_]/g, '');
            if (!cleanCol) return;

            // Check if column exists
            const result = await this.db.query(`PRAGMA table_info(${table});`);
            const columns = result.values?.map(c => c.name) || [];

            if (!columns.includes(cleanCol)) {
                await this.db.execute(`ALTER TABLE ${table} ADD COLUMN ${cleanCol} TEXT;`);
                console.log(`✅ [DYNAMIC SCHEMA] Coluna '${cleanCol}' criada automaticamente em '${table}'.`);
            }
        } catch (e) {
            console.error(`Erro ao garantir coluna dinâmica ${column}:`, e);
            // Don't throw, just log.
        }
    }
}

export const dbService = new DatabaseService();
