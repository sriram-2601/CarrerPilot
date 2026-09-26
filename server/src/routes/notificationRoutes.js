import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(notificationController.listNotifications));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

export default router;
