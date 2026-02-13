import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Rotas Públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas Protegidas
router.get('/pending',
    authMiddleware.protect,
    authMiddleware.restrictTo('MASTER'),
    authController.getPendingUsers
);

router.post('/approve',
    authMiddleware.protect,
    authController.approveUser
);

// Rotas de Recuperação (Públicas)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
