import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(profileController.getProfile));
router.get('/history', asyncHandler(profileController.getHistory));
router.post('/upload-resume', resumeUpload, asyncHandler(profileController.uploadResume));
router.patch('/preferences', asyncHandler(profileController.updatePreferences));

export default router;
