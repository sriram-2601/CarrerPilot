import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    content: { type: String, required: true },
    changeSummary: { type: [String], default: [] },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ResumeVersion = mongoose.models.ResumeVersion || mongoose.model('ResumeVersion', resumeVersionSchema);
