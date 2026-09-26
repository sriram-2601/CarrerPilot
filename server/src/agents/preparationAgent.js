export async function generateResumeVariant(profile, internship) {
  if (!profile || !internship) {
    throw new Error('Profile and internship are required to generate tailored resume variant.');
  }

  const candidateSkills = profile.skills || [];
  const requiredSkills = internship.skillsRequired || [];

  const candidateLowerMap = new Map();
  candidateSkills.forEach(s => candidateLowerMap.set(s.toLowerCase(), s));

  const matchedSkills = [];
  const missingSkills = [];

  for (const req of requiredSkills) {
    const original = candidateLowerMap.get(req.toLowerCase());
    if (original) {
      matchedSkills.push(original);
    } else {
      missingSkills.push(req);
    }
  }

  // Other candidate skills not explicitly listed in internship requirements
  const matchedLowerSet = new Set(matchedSkills.map(s => s.toLowerCase()));
  const otherCandidateSkills = candidateSkills.filter(s => !matchedLowerSet.has(s.toLowerCase()));

  // Re-tailored Skills: required matching tokens first, then candidate's remaining verified skills
  // NO REMOVALS and NO FABRICATION
  const tailoredSkills = [...matchedSkills, ...otherCandidateSkills];
  const tailoredSkillsString = tailoredSkills.length > 0 ? tailoredSkills.join(', ') : 'Technical fundamentals';

  // Base text from candidate's real resume
  let baseText = profile.resumeText || '';
  if (!baseText || baseText.trim().length === 0) {
    baseText = buildDefaultResumeText(profile);
  }

  // Replace or inject Skills section
  let content = '';
  const skillsRegex = /(?:^|\n)(skills|technical skills|core competencies)\s*[:\-]?\s*(.*?)(?=\n[A-Z\s]{3,}:|\n\n|$)/is;

  if (skillsRegex.test(baseText)) {
    content = baseText.replace(skillsRegex, `\nTechnical Skills: ${tailoredSkillsString}\n`);
  } else {
    // Prepend after header or at top
    content = `Technical Skills: ${tailoredSkillsString}\n\n` + baseText;
  }

  const changeSummary = [
    `Re-ordered Skills section to feature matching keywords first: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None matched'}`,
    `Preserved 100% of candidate's verified skills without artificial fabrication`,
    `Highlighted alignment for ${internship.title} at ${internship.company}`
  ];

  if (missingSkills.length > 0) {
    changeSummary.push(`Noted ${missingSkills.length} missing prerequisite skills for interview prep: ${missingSkills.join(', ')}`);
  }

  return {
    content: content.trim(),
    changeSummary,
    matchedSkills,
    missingSkills,
    approved: false
  };
}

function buildDefaultResumeText(profile) {
  let text = 'CANDIDATE RESUME\n\n';
  if (profile.skills && profile.skills.length > 0) {
    text += `Technical Skills: ${profile.skills.join(', ')}\n\n`;
  }
  if (profile.projects && profile.projects.length > 0) {
    text += 'Projects:\n';
    for (const p of profile.projects) {
      text += `- ${p.title}: ${p.description}\n`;
    }
    text += '\n';
  }
  if (profile.education && profile.education.length > 0) {
    text += 'Education:\n';
    for (const e of profile.education) {
      text += `- ${e.degree}, ${e.institution} (${e.year})\n`;
    }
  }
  return text;
}
