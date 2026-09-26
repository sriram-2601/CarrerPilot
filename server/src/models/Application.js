import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['SAVED', 'PREPARING', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

export const STATUS_RANK = {
  SAVED: 1,
  PREPARING: 2,
  APPLIED: 3,
  INTERVIEW: 4,
  OFFER: 5,
  REJECTED: 6
};

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'SAVED'
    },
    appliedAt: { type: Date },
    nextActionDate: { type: Date },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
