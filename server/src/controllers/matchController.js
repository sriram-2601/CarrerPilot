import { repository } from '../services/repository.js';
import { pipelineService } from '../services/pipelineService.js';

export const matchController = {
  async generateMatches(req, res) {
    const matches = await pipelineService.regenerateMatches(req.user.id);
    res.json({
      message: 'Match scores generated successfully across internships.',
      count: matches.length,
      matches
    });
  },

  async listMatches(req, res) {
    const matches = await repository.getAll('Match', { userId: req.user.id });
    const enriched = [];

    for (const match of matches) {
      const internship = await repository.getById('Internship', match.internshipId);
      enriched.push({
        ...match,
        internship: internship || null
      });
    }

    enriched.sort((a, b) => (b.score || 0) - (a.score || 0));
    res.json(enriched);
  }
};
