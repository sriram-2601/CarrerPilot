import { repository } from '../services/repository.js';
import { generateResumeVariant } from '../agents/preparationAgent.js';
import { textToPdf } from '../utils/pdf.js';
import { httpError } from '../utils/httpError.js';
import { STATUS_RANK } from '../models/Application.js';

function normalizeId(val) {
  if (!val) return '';
  return typeof val === 'object' && val.toString ? val.toString() : String(val);
}

export const applicationMaterialsController = {
  async listVersions(req, res) {
    const versions = await repository.getAll(
      'ResumeVersion',
      { userId: req.user.id },
      { createdAt: -1 }
    );
    res.json(versions);
  },

  async generateVariant(req, res) {
    const { internshipId } = req.body;
    if (!internshipId) {
      throw httpError(400, 'internshipId is required in request body.');
    }

    const userId = req.user.id;
    const profile = await repository.getOne('Profile', { userId });
    if (!profile || !profile.resumeText || profile.resumeText.length < 30) {
      throw httpError(400, 'Cannot generate tailored resume without an uploaded resume and profile.');
    }

    const internship = await repository.getById('Internship', internshipId);
    if (!internship) {
      throw httpError(404, 'Internship not found.');
    }

    const variant = await generateResumeVariant(profile, internship);

    const versionDoc = {
      userId,
      internshipId,
      content: variant.content,
      changeSummary: variant.changeSummary,
      matchedSkills: variant.matchedSkills,
      missingSkills: variant.missingSkills,
      approved: false
    };

    const savedVersion = await repository.upsert(
      'ResumeVersion',
      { userId, internshipId },
      versionDoc,
      versionDoc
    );

    // Progress or create Application status to PREPARING
    const existingApp = await repository.getOne('Application', { userId, internshipId });
    if (!existingApp) {
      await repository.create('Application', {
        userId,
        internshipId,
        status: 'PREPARING',
        notes: `Tailored resume generated for ${internship.title}.`
      });
    } else {
      const currentRank = STATUS_RANK[existingApp.status] || 1;
      const preparingRank = STATUS_RANK.PREPARING;
      if (currentRank < preparingRank) {
        await repository.updateById('Application', existingApp._id, {
          status: 'PREPARING'
        });
      }
    }

    res.json({
      message: 'Tailored resume generated successfully.',
      version: savedVersion
    });
  },

  async approveVariant(req, res) {
    const { id } = req.body;
    if (!id) {
      throw httpError(400, 'Resume version id is required.');
    }

    const version = await repository.getById('ResumeVersion', id);
    if (!version || normalizeId(version.userId) !== normalizeId(req.user.id)) {
      throw httpError(404, 'Resume version not found or access unauthorized.');
    }

    const updated = await repository.updateById('ResumeVersion', id, {
      approved: true
    });

    res.json({
      message: 'Resume version approved.',
      version: updated
    });
  },

  async streamPdf(req, res) {
    const { id } = req.params;
    const version = await repository.getById('ResumeVersion', id);

    if (!version || normalizeId(version.userId) !== normalizeId(req.user.id)) {
      throw httpError(404, 'Resume version not found or access unauthorized.');
    }

    const pdfBuffer = textToPdf(version.content, {
      title: 'CareerPilot AI Tailored Resume'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="tailored-resume.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }
};
