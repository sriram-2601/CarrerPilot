import bcrypt from 'bcryptjs';
import { repository } from './repository.js';
import { seedInternships } from '../data/seedInternships.js';

export async function seedInitialData() {
  try {
    // 1. Seed internships if none exist
    const existingInternships = await repository.getAll('Internship');
    if (!existingInternships || existingInternships.length === 0) {
      console.log('[CareerPilot Seed] Seeding initial internships...');
      for (const internship of seedInternships) {
        await repository.create('Internship', internship);
      }
      console.log(`[CareerPilot Seed] Seeded ${seedInternships.length} foundational internships.`);
    }

    // 2. Seed demo user (demo@careerpilot.ai / Password@123)
    const demoEmail = 'demo@careerpilot.ai';
    const existingDemoUser = await repository.getOne('User', { email: demoEmail });
    if (!existingDemoUser) {
      console.log('[CareerPilot Seed] Seeding default demo user (demo@careerpilot.ai)...');
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      const user = await repository.create('User', {
        name: 'Demo Student',
        email: demoEmail,
        password: hashedPassword
      });

      // Create initial profile for demo user
      await repository.create('Profile', {
        userId: user._id,
        skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
        projects: [
          {
            title: 'Campus Event Portal',
            description: 'Full stack event registration app with attendee tracking and QR check-in.',
            technologies: ['React', 'JavaScript', 'Tailwind CSS']
          }
        ],
        experience: [],
        education: [
          {
            institution: 'State University of Technology',
            degree: 'B.S. in Computer Science',
            year: '2026'
          }
        ],
        preferences: {
          roles: ['Frontend Developer', 'Full Stack Developer'],
          location: 'Remote',
          workMode: 'Remote',
          stipendRange: '$25 - $45 / hr'
        },
        resumeText: 'Demo Student. Computer Science student skilled in JavaScript, React, HTML, CSS, Git. Built Campus Event Portal.',
        embedding: []
      });
      console.log('[CareerPilot Seed] Demo user created successfully.');
    }
  } catch (error) {
    console.error('[CareerPilot Seed] Error during data seeding:', error.message);
  }
}
