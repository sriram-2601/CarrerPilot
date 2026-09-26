import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    reason: { type: String, default: '' }
  },
  { timestamps: true }
);

matchSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
