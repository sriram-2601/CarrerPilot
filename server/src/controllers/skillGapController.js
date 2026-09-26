import { repository } from '../services/repository.js';
import { buildSkillGapReport } from '../agents/skillGapAgent.js';
import { httpError } from '../utils/httpError.js';

export const skillGapController = {
  async getSkillGaps(req, res) {
    const { internshipId } = req.params;
    const userId = req.user.id;

    const match = await repository.getOne('Match', { userId, internshipId });
    if (!match) {
      throw httpError(404, 'No match analysis exists for this internship. Please calculate match score first.');
    }

    const internship = await repository.getById('Internship', internshipId);
    const studyPlan = buildSkillGapReport(match);

    res.json({
      internshipId,
      internshipTitle: internship?.title || 'Internship',
      company: internship?.company || 'Company',
      matchScore: match.score,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      studyPlan
    });
  }
};
