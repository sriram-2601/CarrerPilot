import { repository } from './repository.js';
import { discoverInternships } from '../agents/discoveryAgent.js';
import { scoreInternship } from '../agents/matchingAgent.js';
import { httpError } from '../utils/httpError.js';

export const pipelineService = {
  async syncInternshipsForProfile(profile) {
    const discovered = await discoverInternships(profile);
    const savedList = [];

    for (const item of discovered) {
      const filter = {
        company: item.company,
        title: item.title,
        applyLink: item.applyLink
      };

      const upserted = await repository.upsert('Internship', filter, item, item);
      savedList.push(upserted);
    }

    return savedList;
  },

  async regenerateMatches(userId) {
    const profile = await repository.getOne('Profile', { userId });
    if (!profile || !profile.resumeText || profile.resumeText.trim().length < 30) {
      throw httpError(400, 'Cannot generate matches without an uploaded resume and parsed profile.');
    }

    const internships = await repository.getAll('Internship');
    if (!internships || internships.length === 0) {
      return [];
    }

    const results = [];

    for (const internship of internships) {
      const matchResult = await scoreInternship(profile, internship);
      const matchDoc = {
        userId,
        internshipId: internship._id,
        score: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        reason: matchResult.reason
      };

      const saved = await repository.upsert(
        'Match',
        { userId, internshipId: internship._id },
        matchDoc,
        matchDoc
      );
      results.push({ ...saved, internship });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }
};
