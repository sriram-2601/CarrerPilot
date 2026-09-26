import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, default: '' },
    skillsRequired: { type: [String], default: [] },
    location: { type: String, default: 'Remote' },
    applyLink: { type: String, required: true },
    source: { type: String, default: 'catalog' },
    deadline: { type: Date },
    postedDate: { type: Date, default: Date.now },
    embedding: { type: [Number], default: [] }
  },
  { timestamps: true }
);

internshipSchema.index({ company: 1, title: 1, applyLink: 1 }, { unique: true });

export const Internship = mongoose.models.Internship || mongoose.model('Internship', internshipSchema);
