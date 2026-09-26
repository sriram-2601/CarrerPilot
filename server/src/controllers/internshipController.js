import { repository } from '../services/repository.js';
import { pipelineService } from '../services/pipelineService.js';

function normalizeId(val) {
  if (!val) return '';
  return typeof val === 'object' && val.toString ? val.toString() : String(val);
}

export const internshipController = {
  async listInternships(req, res) {
    const internships = await repository.getAll('Internship', {}, { postedDate: -1 });
    const userMatches = await repository.getAll('Match', { userId: req.user.id });

    const enriched = internships.map(item => {
      let applyLink = item.applyLink || '';
      // Repair legacy placeholder links
      if (applyLink.includes('example.com')) {
        applyLink = `https://www.google.com/search?q=${encodeURIComponent(`${item.company} ${item.title} internship application`)}`;
      }

      const match = userMatches.find(m => normalizeId(m.internshipId) === normalizeId(item._id));

      return {
        ...item,
        applyLink,
        match: match
          ? {
              id: match._id,
              score: match.score,
              matchedSkills: match.matchedSkills,
              missingSkills: match.missingSkills,
              reason: match.reason
            }
          : null
      };
    });

    res.json(enriched);
  },

  async syncInternships(req, res) {
    const profile = await repository.getOne('Profile', { userId: req.user.id });
    const updated = await pipelineService.syncInternshipsForProfile(profile);

    res.json({
      count: updated.length,
      internships: updated
    });
  }
};
