import { repository } from '../services/repository.js';
import { httpError } from '../utils/httpError.js';

function normalizeId(val) {
  if (!val) return '';
  return typeof val === 'object' && val.toString ? val.toString() : String(val);
}

export const notificationController = {
  async listNotifications(req, res) {
    const notifications = await repository.getAll(
      'Notification',
      { userId: req.user.id },
      { createdAt: -1 }
    );
    res.json(notifications);
  },

  async markAsRead(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await repository.getById('Notification', id);
    if (!notif || normalizeId(notif.userId) !== normalizeId(userId)) {
      throw httpError(404, 'Notification not found or access unauthorized.');
    }

    const updated = await repository.updateById('Notification', id, { read: true });
    res.json(updated);
  }
};
