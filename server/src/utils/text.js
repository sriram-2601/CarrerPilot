import { knownSkills } from '../data/knownSkills.js';

export function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.toLowerCase();
  const matched = new Set();

  for (const skill of knownSkills) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // For skills like C++, ensure we match properly without broken word boundaries
    let pattern;
    if (skill === 'C++') {
      pattern = /(?:^|[\s,;:(/])c\+\+(?:$|[\s,;:)/])/i;
    } else if (skill === 'Node.js') {
      pattern = /(?:^|[\s,;:(/])node(?:\.js)?(?:$|[\s,;:)/])/i;
    } else if (skill === 'Next.js') {
      pattern = /(?:^|[\s,;:(/])next(?:\.js)?(?:$|[\s,;:)/])/i;
    } else if (skill === 'REST APIs') {
      pattern = /\brest(?:ful)?\s*(?:apis?|services?)?\b/i;
    } else {
      pattern = new RegExp(`\\b${escaped}\\b`, 'i');
    }

    if (pattern.test(normalized)) {
      matched.add(skill);
    }
  }

  return Array.from(matched);
}

export function summarizeText(text) {
  if (!text || typeof text !== 'string') return '';
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 20 && !l.toLowerCase().includes('page'));

  if (lines.length === 0) {
    return 'Motivated candidate with a technical foundation seeking internship opportunities.';
  }

  // Pick candidate name / title or first couple of content sentences
  const leadSentences = lines.slice(0, 3).join('. ');
  return leadSentences.length > 250 ? leadSentences.slice(0, 247) + '...' : leadSentences;
}

export function generateEmbeddingFallback(text) {
  const DIMENSIONS = 128;
  const embedding = new Array(DIMENSIONS).fill(0);
  if (!text) return embedding;

  const normalized = text.toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (i * 31 + charCode) % DIMENSIONS;
    embedding[index] += (charCode % 10) / 10;
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  return embedding.map(val => Number((val / magnitude).toFixed(6)));
}

export function generateMatchReason(matchedSkills = [], missingSkills = [], score = 0) {
  const matchedStr = matchedSkills.length > 0 ? matchedSkills.join(', ') : 'no core requirements yet';
  const missingStr = missingSkills.length > 0 ? missingSkills.join(', ') : 'none';

  if (score >= 80) {
    return `Strong candidate match (${score}%). Candidate demonstrates key strengths in ${matchedStr}. Few or no critical skill gaps (${missingStr}).`;
  } else if (score >= 50) {
    return `Moderate match (${score}%). Profile aligns with ${matchedStr}, but would benefit from gaining experience in ${missingStr}.`;
  } else {
    return `Emerging alignment (${score}%). Found initial overlap in ${matchedStr}. Key technical gaps to bridge: ${missingStr}.`;
  }
}
