import express from 'express';
import { healthController } from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(healthController.getHealth));

export default router;
