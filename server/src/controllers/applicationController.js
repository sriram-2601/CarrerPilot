import { repository } from '../services/repository.js';
import { httpError } from '../utils/httpError.js';
import { STATUS_RANK, APPLICATION_STATUSES } from '../models/Application.js';

function normalizeId(val) {
  if (!val) return '';
  return typeof val === 'object' && val.toString ? val.toString() : String(val);
}

export const applicationController = {
  async listApplications(req, res) {
    const userId = req.user.id;
    const applications = await repository.getAll('Application', { userId });
    const enriched = [];

    for (const app of applications) {
      const internship = await repository.getById('Internship', app.internshipId);
      const match = await repository.getOne('Match', { userId, internshipId: app.internshipId });
      enriched.push({
        ...app,
        internship: internship || null,
        matchScore: match?.score || null
      });
    }

    res.json(enriched);
  },

  async createOrProgress(req, res) {
    const { internshipId, status = 'SAVED', notes = '', nextActionDate } = req.body;
    const userId = req.user.id;

    if (!internshipId) {
      throw httpError(400, 'internshipId is required.');
    }

    const internship = await repository.getById('Internship', internshipId);
    if (!internship) {
      throw httpError(404, 'Internship not found.');
    }

    const existing = await repository.getOne('Application', { userId, internshipId });

    if (existing) {
      // Progress upward if incoming status is higher rank
      const currentRank = STATUS_RANK[existing.status] || 1;
      const targetRank = STATUS_RANK[status] || 1;
      const newStatus = targetRank > currentRank ? status : existing.status;

      const updateData = {
        status: newStatus,
        notes: notes ? notes : existing.notes
      };

      if (newStatus === 'APPLIED' && !existing.appliedAt) {
        updateData.appliedAt = new Date();
      }
      if (nextActionDate) {
        updateData.nextActionDate = new Date(nextActionDate);
      }

      const updated = await repository.updateById('Application', existing._id, updateData);

      // Milestone notification if status upgraded
      if (targetRank > currentRank) {
        await checkAndRaiseMilestoneNotification(userId, internship, newStatus);
      }

      return res.json({
        message: 'Application status progressed.',
        application: { ...updated, internship }
      });
    }

    // New application creation
    const newDoc = {
      userId,
      internshipId,
      status: APPLICATION_STATUSES.includes(status) ? status : 'SAVED',
      notes,
      appliedAt: status === 'APPLIED' ? new Date() : null,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : null
    };

    const created = await repository.create('Application', newDoc);

    // Initial notification
    await repository.create('Notification', {
      userId,
      title: 'Opportunity Saved',
      message: `Saved ${internship.title} at ${internship.company} to your tracking kanban.`
    });

    if (status === 'APPLIED' || status === 'INTERVIEW' || status === 'OFFER') {
      await checkAndRaiseMilestoneNotification(userId, internship, status);
    }

    res.status(201).json({
      message: 'Application tracked successfully.',
      application: { ...created, internship }
    });
  },

  async updateApplication(req, res) {
    const { id } = req.params;
    const { status, nextActionDate, notes } = req.body;
    const userId = req.user.id;

    const existing = await repository.getById('Application', id);
    if (!existing || normalizeId(existing.userId) !== normalizeId(userId)) {
      throw httpError(404, 'Application not found or access unauthorized.');
    }

    const updateData = {};
    let statusChanged = false;

    if (status && APPLICATION_STATUSES.includes(status)) {
      // Enforce upward-only or intentional status updates
      updateData.status = status;
      if (status !== existing.status) {
        statusChanged = true;
      }
      if (status === 'APPLIED' && !existing.appliedAt) {
        updateData.appliedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (nextActionDate !== undefined) {
      updateData.nextActionDate = nextActionDate ? new Date(nextActionDate) : null;
    }

    const updated = await repository.updateById('Application', id, updateData);
    const internship = await repository.getById('Internship', existing.internshipId);

    if (statusChanged && internship) {
      await checkAndRaiseMilestoneNotification(userId, internship, status);
    }

    res.json({
      message: 'Application updated successfully.',
      application: { ...updated, internship }
    });
  },

  async deleteApplication(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await repository.getById('Application', id);
    if (!existing || normalizeId(existing.userId) !== normalizeId(userId)) {
      throw httpError(404, 'Application not found or access unauthorized.');
    }

    await repository.deleteById('Application', id);
    res.json({ message: 'Application removed from tracker.' });
  }
};

async function checkAndRaiseMilestoneNotification(userId, internship, status) {
  try {
    let title = '';
    let message = '';

    if (status === 'APPLIED') {
      title = 'Application Submitted';
      message = `Marked as applied for ${internship.title} at ${internship.company}. Good luck!`;
    } else if (status === 'INTERVIEW') {
      title = 'Interview Milestone Reached!';
      message = `Congratulations! You advanced to the Interview stage for ${internship.title} at ${internship.company}.`;
    } else if (status === 'OFFER') {
      title = 'Offer Received! 🎉';
      message = `Exceptional achievement! You received an offer for ${internship.title} at ${internship.company}!`;
    }

    if (title) {
      await repository.create('Notification', {
        userId,
        title,
        message,
        read: false
      });
    }
  } catch (err) {
    console.warn('[CareerPilot Notification] Warning raising milestone notification:', err.message);
  }
}
