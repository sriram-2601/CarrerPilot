import { repository } from '../services/repository.js';
import { buildAnalytics } from '../agents/feedbackAgent.js';

export const analyticsController = {
  async getAnalytics(req, res) {
    const userId = req.user.id;

    const applications = await repository.getAll('Application', { userId });
    const matches = await repository.getAll('Match', { userId });
    const profile = await repository.getOne('Profile', { userId });

    const analytics = buildAnalytics(applications, matches, profile);
    res.json(analytics);
  }
};
