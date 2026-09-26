import { generateLocalText } from '../services/ollamaService.js';
import { generateMatchReason } from '../utils/text.js';

export async function scoreInternship(profile, internship) {
  if (!profile || !internship) {
    throw new Error('Both profile and internship are required for match scoring');
  }

  const candidateSkills = (profile.skills || []).map(s => s.trim().toLowerCase());
  const requiredSkills = internship.skillsRequired || [];

  const matchedSkills = [];
  const missingSkills = [];

  for (const req of requiredSkills) {
    if (candidateSkills.includes(req.toLowerCase())) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  // 1. Skill Score: up to 80 points
  const totalReq = Math.max(1, requiredSkills.length);
  const skillScore = (matchedSkills.length / totalReq) * 80;

  // 2. Role Boost: +10 if internship title overlaps with user preferred roles
  let roleBoost = 0;
  const preferredRoles = (profile.preferences?.roles || []).map(r => r.toLowerCase());
  const titleLower = (internship.title || '').toLowerCase();
  for (const role of preferredRoles) {
    if (titleLower.includes(role)) {
      roleBoost = 10;
      break;
    }
  }

  // 3. Location Boost: +10 if location matches user preference or is Remote
  let locationBoost = 0;
  const prefLocation = (profile.preferences?.location || '').toLowerCase();
  const jobLocation = (internship.location || '').toLowerCase();
  if (jobLocation.includes('remote') || (prefLocation && jobLocation.includes(prefLocation))) {
    locationBoost = 10;
  }

  // 4. Final Score capped at 100
  const finalScore = Math.min(100, Math.round(skillScore + roleBoost + locationBoost));

  // 5. Rationale: LLM or deterministic fallback
  let reason = '';
  try {
    const prompt = `Explain in one professional, concise sentence why a student with skills [${matchedSkills.join(', ')}] scored ${finalScore}% for the internship "${internship.title}" at "${internship.company}", mentioning missing skills [${missingSkills.join(', ')}].`;
    reason = await generateLocalText(prompt);
  } catch (err) {
    reason = '';
  }

  if (!reason || reason.trim() === '') {
    reason = generateMatchReason(matchedSkills, missingSkills, finalScore);
  }

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    reason: reason.trim()
  };
}
