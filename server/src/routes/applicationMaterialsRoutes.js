import express from 'express';
import { applicationMaterialsController } from '../controllers/applicationMaterialsController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(applicationMaterialsController.listVersions));
router.post('/generate', asyncHandler(applicationMaterialsController.generateVariant));
router.post('/approve', asyncHandler(applicationMaterialsController.approveVariant));
router.get('/:id/pdf', asyncHandler(applicationMaterialsController.streamPdf));

export default router;
