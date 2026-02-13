import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as EmailService from '../services/EmailService.js';

// Helper para gerar JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_fallback_123', {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
};

// 1. REGISTRO AUTOMÁTICO (SaaS Multi-Tenant)
export const register = async (req, res) => {
    try {
        // Se client_id for 'NEW' ou vier vazio, criamos uma nova organização.
        // Caso contrário, tenta vincular a uma existente (convite).
        let { nome, email, password, client_id, motivo_cadastro, organization, cnpj } = req.body;

        if (!motivo_cadastro) {
            return res.status(400).json({ success: false, message: 'Motivo obrigatório.' });
        }

        let finalClientId = client_id;
        let isNewOrganization = false;

        // Lógica de CRIAÇÃO DE NOVA PREFEITURA/EMPRESA
        if (!client_id || client_id === 'NEW' || client_id === '11111111-1111-1111-1111-111111111111') {
            // Se veio o ID padrão de teste, vamos ignorar e criar um novo REAL para evitar colisões
            // a menos que seja explicitamente um convite (que não é o caso aqui, pois é registro público)

            if (!organization) {
                return res.status(400).json({ success: false, message: 'Nome da Organização/Prefeitura é obrigatório para novos cadastros.' });
            }

            // Gerar novo ID para a Empresa
            finalClientId = uuidv4();
            isNewOrganization = true;

            // Criar a Organização no Banco
            await db.execute(
                `INSERT INTO clients (id, nome, documento, estado, admin_master_email, created_at) 
                 VALUES (?, ?, ?, 'UF', ?, NOW())`,
                [finalClientId, organization, cnpj, email]
            );

            console.log(`✨ Nova Organização Criada: ${organization} (${finalClientId})`);
        } else {
            // Verificar se cliente existe (Fluxo de Convite)
            const [clientCheck] = await db.execute('SELECT id FROM clients WHERE id = ?', [client_id]);
            if (clientCheck.length === 0) {
                return res.status(404).json({ success: false, message: 'ID da Organização inválido.' });
            }
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        // Se for nova organização, o primeiro usuário é MASTER e já nasce ATIVO (Auto-Aprovação do Dono)
        // Se for convite, entra como OPERADOR PENDENTE
        const role = isNewOrganization ? 'MASTER' : 'OPERADOR';
        const status = isNewOrganization ? 'ATIVO' : 'PENDENTE'; // Dono já entra aprovado!

        // Inserir usuário
        await db.execute(
            `INSERT INTO users (id, client_id, nome, email, password_hash, role, status, motivo_cadastro, department) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, finalClientId, nome, email, password_hash, role, status, motivo_cadastro, 'Administração']
        );

        res.status(201).json({
            success: true,
            // Retornamos dados extras para o frontend saber o que aconteceu
            message: isNewOrganization
                ? 'Organização criada com sucesso! Você é o Administrador Master.'
                : 'Cadastro solicitado. Aguarde aprovação.',
            user: { id: userId, email, role, status, client_id: finalClientId }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Este email já está cadastrado.' });
        }
        console.error("Erro Registro:", error);
        res.status(500).json({ success: false, message: 'Erro interno ao registrar.' });
    }
};

// 2. LOGIN (Só entra se ATIVO)
export const login = async (req, res) => {
    try {
        console.log('👉 Login Request Received:', req.body.email);
        const { email, password, client_id } = req.body;

        if (!email || !password || !client_id) {
            return res.status(400).json({ success: false, message: 'Forneça email, senha e ID da organização.' });
        }

        // Buscar usuário e senha
        console.log('🔍 Buscando usuário no banco...');
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND client_id = ?',
            [email, client_id]
        );
        console.log('✅ Busca concluída. Usuários encontrados:', rows.length);
        const user = rows[0];

        // Verificar existência e senha
        if (!user) {
            console.log('❌ Usuário não encontrado.');
            return res.status(401).json({ success: false, message: 'Credenciais incorretas.' });
        }

        console.log('🔐 Verificando senha...');
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log('❌ Senha inválida.');
            return res.status(401).json({ success: false, message: 'Credenciais incorretas.' });
        }

        // CRÍTICO: Verificar Status
        if (user.status !== 'ATIVO') {
            return res.status(403).json({
                success: false,
                message: `Acesso negado. Seu status atual é: ${user.status}. Contate o administrador.`
            });
        }

        // Gerar Token
        const token = signToken(user.id);

        // Atualizar último login
        await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Remover senha do retorno
        user.password_hash = undefined;

        res.status(200).json({
            success: true,
            token,
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro interno no login.' });
    }
};

// 3. APROVAÇÃO (Centralizada no SUPER ADM)
export const approveUser = async (req, res) => {
    try {
        const { userId, action } = req.body;
        const approver = req.user;

        // VERIFICAÇÃO DE SUPER ADMIN (GM SYSTEMS)
        // Apenas usuários da organização "GM Systems Holding" (ID 111..) podem aprovar
        const SYSTEM_ADMIN_ID = '11111111-1111-1111-1111-111111111111';

        if (approver.client_id !== SYSTEM_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: 'Apenas a GM Systems (Administrador Central) pode autorizar novos usuários.'
            });
        }

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Ação inválida.' });
        }

        const newStatus = action === 'APPROVE' ? 'ATIVO' : 'REJEITADO';

        // Super Admin pode aprovar DE QUALQUER cliente (Removemos o filtro de client_id)
        const [result] = await db.execute(
            `UPDATE users 
             SET status = ?, approved_by = ?, approved_at = NOW() 
             WHERE id = ?`,
            [newStatus, approver.id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        res.status(200).json({
            success: true,
            message: `Usuário ${action === 'APPROVE' ? 'aprovado' : 'rejeitado'} com sucesso pelo Administrador Central.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao processar aprovação.' });
    }
};

// 4. LISTAR PENDENTES (Visão Global para Super Admin, Local para Gestores)
export const getPendingUsers = async (req, res) => {
    try {
        const SYSTEM_ADMIN_ID = '11111111-1111-1111-1111-111111111111';
        const isSuperAdmin = req.user.client_id === SYSTEM_ADMIN_ID;

        let query = `SELECT u.id, u.nome, u.email, u.role, u.motivo_cadastro, u.created_at, c.nome as organization_name
                     FROM users u
                     LEFT JOIN clients c ON u.client_id = c.id
                     WHERE u.status = 'PENDENTE'`;

        let params = [];

        // Se NÃO for Super Admin, vê apenas os da sua própria organização
        // (Isso permite que o gestor saiba quem está esperando, mas ele não tem botão de aprovar)
        if (!isSuperAdmin) {
            query += ` AND u.client_id = ?`;
            params.push(req.user.client_id);
        }

        const [rows] = await db.execute(query, params);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar pendentes.' });
    }
};

// 5. ESQUECI MINHA SENHA
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'E-mail obrigatório.' });

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        // Gerar Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetTokenHash, passwordExpires, user.id]
        );

        // Enviar E-mail (Real ou Log)
        await EmailService.sendResetToken(email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Código de recuperação enviado para seu e-mail.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação.' });
    }
};

// 6. REDEFINIR SENHA
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token e nova senha obrigatórios.' });
        }

        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const [rows] = await db.execute(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [resetTokenHash]
        );

        const user = rows[0];
        if (!user) {
            return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await db.execute(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        res.status(200).json({ success: true, message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao redefinir senha.' });
    }
};
