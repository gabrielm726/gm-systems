
import db from '../config/database.js';

export const downloadBackup = async (req, res) => {
    const clientId = req.user.client_id;
    const requesterEmail = req.user.email;

    console.log(`📦 Iniciando Backup solicitado por ${requesterEmail} para ClientID: ${clientId}`);

    try {
        // 1. Definição do Escopo de Backup (Tabelas Isoladas)
        // Apenas dados pertencentes ao client_id do solicitante
        const queries = {
            assets: 'SELECT * FROM assets WHERE client_id = ?',
            locations: 'SELECT * FROM locations WHERE client_id = ?',
            users: 'SELECT id, nome, email, role, status, created_at FROM users WHERE client_id = ?', // Sanitize passwords
            audit_logs: 'SELECT * FROM audit_logs WHERE client_id = ?',
            inventory_sessions: 'SELECT * FROM inventory_sessions WHERE client_id = ?',
            inventory_items: 'SELECT * FROM inventory_items WHERE client_id = ?'
        };

        const backupData = {
            metadata: {
                generated_at: new Date().toISOString(),
                exported_by: requesterEmail,
                client_id: clientId,
                system_version: '2.5.0',
                compliance: 'LGPD_SECURE_WIPE'
            },
            data: {}
        };

        // 2. Execução das Queries em Paralelo
        // Nota: Em bancos gigantes, faríamos streams. Para este escopo, JSON em memória é aceitável.
        for (const [key, query] of Object.entries(queries)) {
            try {
                const [rows] = await db.execute(query, [clientId]);
                backupData.data[key] = rows;
                console.log(`   - ${key}: ${rows.length} registros exportados.`);
            } catch (err) {
                console.warn(`   ! Erro ao exportar tabela ${key}:`, err.message);
                // Não falha o backup inteiro se uma tabela opcional (ex: inventory) não existir ainda
                if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
            }
        }

        // 3. Auditoria da Ação
        await db.execute(
            `INSERT INTO audit_logs (id, client_id, user_id, action, details, ip_address, user_agent) 
             VALUES (UUID(), ?, ?, 'BACKUP_EXPORT', ?, ?, ?)`,
            [
                clientId,
                req.user.id,
                JSON.stringify({ timestamp: new Date(), size_records: Object.keys(backupData.data).map(k => backupData.data[k].length) }),
                req.ip || '::1',
                req.headers['user-agent'] || 'System'
            ]
        );

        // 4. Envio do Arquivo
        const filename = `BACKUP_${req.user.nome.replace(/\s+/g, '_').toUpperCase()}_${new Date().toISOString().split('T')[0]}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(JSON.stringify(backupData, null, 2));

    } catch (error) {
        console.error("❌ Erro Crítico no Backup:", error);
        res.status(500).json({
            success: false,
            message: 'Falha ao gerar backup de segurança.',
            error: error.message
        });
    }
};
