import express from 'express';
import { internshipController } from '../controllers/internshipController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(internshipController.listInternships));
router.post('/sync', asyncHandler(internshipController.syncInternships));

export default router;
