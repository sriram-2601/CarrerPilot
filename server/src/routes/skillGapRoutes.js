import express from 'express';
import { skillGapController } from '../controllers/skillGapController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/:internshipId', asyncHandler(skillGapController.getSkillGaps));

export default router;
