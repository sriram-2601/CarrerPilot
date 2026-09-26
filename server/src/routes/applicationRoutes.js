import express from 'express';
import { applicationController } from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(applicationController.listApplications));
router.post('/', asyncHandler(applicationController.createOrProgress));
router.patch('/:id', asyncHandler(applicationController.updateApplication));
router.delete('/:id', asyncHandler(applicationController.deleteApplication));

export default router;
