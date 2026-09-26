import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(analyticsController.getAnalytics));

export default router;
