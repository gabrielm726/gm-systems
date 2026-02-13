import express from 'express';
import * as assetController from '../controllers/assetController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware.protect); // Protege todas as rotas

router.get('/', assetController.listAssets);
router.post('/', assetController.createAsset);
router.post('/sync', assetController.syncBatch);

export default router;
