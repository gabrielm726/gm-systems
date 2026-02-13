
import express from 'express';
import * as backupController from '../controllers/backupController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apenas MASTER pode gerar backups
router.get('/download',
    authMiddleware.protect,
    authMiddleware.restrictTo('MASTER'),
    backupController.downloadBackup
);

export default router;
