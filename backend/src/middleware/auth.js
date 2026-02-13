import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Middleware para proteger rotas
export const protect = async (req, res, next) => {
    let token;

    // 1. Verifica se o token existe no Header Authorization
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acesso negado. Faça login para continuar.'
        });
    }

    try {
        // 2. Decodifica o Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Verifica se o usuário ainda existe e está ATIVO no banco
        const [rows] = await db.execute(
            'SELECT id, nome, email, role, status, client_id FROM users WHERE id = ?',
            [decoded.id]
        );

        const currentUser = rows[0];

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'O usuário pertencente a este token não existe mais.'
            });
        }

        // REGRA CRÍTICA: STATUS ATIVO
        if (currentUser.status !== 'ATIVO') {
            return res.status(403).json({
                success: false,
                message: 'Seu usuário ainda não está ativo ou foi bloqueado. Solicite aprovação ao MASTER.'
            });
        }

        // 4. Injeta o usuário e o CLIENT_ID na requisição
        req.user = currentUser;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado.'
        });
    }
};

// Restrição por Role
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para realizar esta ação.'
            });
        }
        next();
    };
};
