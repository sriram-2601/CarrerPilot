import { repository } from '../services/repository.js';
import { parseResume } from '../agents/profileAgent.js';
import { pipelineService } from '../services/pipelineService.js';
import { httpError } from '../utils/httpError.js';

export const profileController = {
  async getProfile(req, res) {
    let profile = await repository.getOne('Profile', { userId: req.user.id });
    if (!profile) {
      profile = await repository.create('Profile', {
        userId: req.user.id,
        skills: [],
        projects: [],
        experience: [],
        education: [],
        preferences: {
          roles: [],
          location: '',
          workMode: 'any',
          stipendRange: ''
        },
        resumeText: '',
        embedding: []
      });
    }

    res.json(profile);
  },

  async getHistory(req, res) {
    const history = await repository.getAll(
      'ResumeHistory',
      { userId: req.user.id },
      { supersededAt: -1, createdAt: -1 }
    );
    res.json(history);
  },

  async uploadResume(req, res) {
    if (!req.file || !req.file.buffer) {
      throw httpError(400, 'Resume file is required. Please upload a PDF resume.');
    }

    // Step 0: Parse in try/catch. If throws or extracted text < 30 chars -> 422 and touch nothing!
    let parsed;
    try {
      parsed = await parseResume(req.file.buffer);
    } catch (parseErr) {
      throw httpError(422, `Unable to parse resume: ${parseErr.message}`);
    }

    if (!parsed.resumeText || parsed.resumeText.length < 30) {
      throw httpError(422, 'Parsed resume text is under 30 characters. Please upload a valid text-based PDF.');
    }

    const userId = req.user.id;
    const existingProfile = await repository.getOne('Profile', { userId });

    // Step 1: Archive previous resume to resumeHistory if meaningful profile existed
    if (existingProfile && (existingProfile.resumeText?.length >= 30 || existingProfile.skills?.length > 0)) {
      const userMatches = await repository.getAll('Match', { userId });
      const userVersions = await repository.getAll('ResumeVersion', { userId });

      // Enrich matches with internship titles if available
      const topMatches = [];
      const sortedMatches = [...userMatches].sort((a, b) => (b.score || 0) - (a.score || 0));
      for (const m of sortedMatches.slice(0, 3)) {
        const internship = await repository.getById('Internship', m.internshipId);
        topMatches.push({
          title: internship?.title || 'Internship Role',
          company: internship?.company || 'Company',
          score: m.score || 0
        });
      }

      const highMatchCount = userMatches.filter(m => (m.score || 0) >= 75).length;

      await repository.create('ResumeHistory', {
        userId,
        label: `Resume archived on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        skills: existingProfile.skills || [],
        summary: existingProfile.resumeText ? existingProfile.resumeText.slice(0, 250) + '...' : '',
        topMatches,
        matchCount: userMatches.length,
        highMatchCount,
        resumeVersionCount: userVersions.length,
        supersededAt: new Date()
      });
    }

    // Step 2: Upsert profile REPLACING skills/projects/experience/education/resumeText/embedding
    // (preserving user preferences)
    const preferences = existingProfile?.preferences || {
      roles: [],
      location: '',
      workMode: 'any',
      stipendRange: ''
    };

    const updateData = {
      skills: parsed.skills,
      projects: parsed.projects,
      experience: parsed.experience,
      education: parsed.education,
      resumeText: parsed.resumeText,
      embedding: parsed.embedding,
      preferences
    };

    const updatedProfile = await repository.upsert(
      'Profile',
      { userId },
      { userId, ...updateData },
      updateData
    );

    // Step 3: Clear this user's matches and resume versions so pipeline restarts
    await repository.deleteWhere('Match', { userId });
    await repository.deleteWhere('ResumeVersion', { userId });

    // Step 4: Best-effort re-sync discovery for the new profile
    try {
      await pipelineService.syncInternshipsForProfile(updatedProfile);
    } catch (syncErr) {
      console.warn('[CareerPilot Discovery] Post-upload discovery sync warning:', syncErr.message);
    }

    res.json({
      message: 'Resume parsed and uploaded successfully. Pipeline reset to reflect new profile.',
      profile: updatedProfile
    });
  },

  async updatePreferences(req, res) {
    const { roles, location, workMode, stipendRange } = req.body;
    const userId = req.user.id;

    const existingProfile = await repository.getOne('Profile', { userId });
    const currentPreferences = existingProfile?.preferences || {};

    const updatedPreferences = {
      roles: Array.isArray(roles) ? roles : currentPreferences.roles || [],
      location: location !== undefined ? location : currentPreferences.location || '',
      workMode: workMode !== undefined ? workMode : currentPreferences.workMode || 'any',
      stipendRange: stipendRange !== undefined ? stipendRange : currentPreferences.stipendRange || ''
    };

    const updatedProfile = await repository.upsert(
      'Profile',
      { userId },
      { userId, preferences: updatedPreferences },
      { preferences: updatedPreferences }
    );

    res.json(updatedProfile);
  }
};
