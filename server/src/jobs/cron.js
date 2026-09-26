import cron from 'node-cron';
import { repository } from '../services/repository.js';

export function startBackgroundJobs() {
  console.log('[CareerPilot Cron] Initializing scheduled background monitoring jobs...');

  // Run every hour to check for upcoming application action reminders
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const applications = await repository.getAll('Application');
      for (const app of applications) {
        if (app.nextActionDate && new Date(app.nextActionDate) > now && new Date(app.nextActionDate) <= in24Hours) {
          const internship = await repository.getById('Internship', app.internshipId);
          // Check if notification was already sent today
          const existingNotifs = await repository.getAll('Notification', {
            userId: app.userId,
            title: 'Action Reminder'
          });
          const recent = existingNotifs.find(n => n.message.includes(internship?.title || ''));
          if (!recent) {
            await repository.create('Notification', {
              userId: app.userId,
              title: 'Action Reminder',
              message: `Upcoming action due for ${internship?.title || 'internship'} at ${internship?.company || 'company'}. Check your kanban notes.`,
              read: false
            });
          }
        }
      }
    } catch (err) {
      console.warn('[CareerPilot Cron] Error during background reminder scan:', err.message);
    }
  });

  console.log('[CareerPilot Cron] Background jobs started.');
}
