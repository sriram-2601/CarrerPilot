import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: { type: [String], default: [] },
    projects: [
      {
        title: { type: String },
        description: { type: String },
        technologies: { type: [String], default: [] }
      }
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String }
      }
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        year: { type: String }
      }
    ],
    preferences: {
      roles: { type: [String], default: [] },
      location: { type: String, default: '' },
      workMode: { type: String, default: 'any' },
      stipendRange: { type: String, default: '' }
    },
    resumeText: { type: String, default: '' },
    embedding: { type: [Number], default: [] }
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
