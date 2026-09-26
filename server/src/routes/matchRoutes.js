import express from 'express';
import { matchController } from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', asyncHandler(matchController.generateMatches));
router.get('/', asyncHandler(matchController.listMatches));

export default router;
