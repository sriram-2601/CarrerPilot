import { knownSkills } from '../data/knownSkills.js';

export function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.toLowerCase();
  const matched = new Set();

  for (const skill of knownSkills) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    let pattern;

    if (skill === 'C++') {
      pattern = /(?:^|[\s,;:(/])c\+\+(?:$|[\s,;:)/])/i;
    } else if (skill === 'Node.js') {
      pattern = /(?:^|[\s,;:(/])node(?:\.js)?(?:$|[\s,;:)/])/i;
    } else if (skill === 'Next.js') {
      pattern = /(?:^|[\s,;:(/])next(?:\.js)?(?:$|[\s,;:)/])/i;
    } else if (skill === 'REST APIs') {
      pattern = /\brest(?:ful)?\s*(?:apis?|services?)?\b/i;
    } else if (skill === 'OWASP Top 10') {
      pattern = /\bowasp(?:\s*top\s*10)?\b/i;
    } else if (skill === 'VAPT') {
      pattern = /\bvapt\b|\bvulnerability\s+assessment\b/i;
    } else if (skill === 'SQL Injection') {
      pattern = /\bsql\s*injection\b|\bsqli\b/i;
    } else if (skill === 'XSS') {
      pattern = /\bxss\b|\bcross[- ]site\s+scripting\b/i;
    } else if (skill === 'CSRF') {
      pattern = /\bcsrf\b|\bcross[- ]site\s+request\s+forgery\b/i;
    } else if (skill === 'API Security') {
      pattern = /\bapi\s+security\b/i;
    } else if (skill === 'Penetration Testing') {
      pattern = /\bpen(?:etration)?\s+testing\b|\bpentest(?:ing)?\b/i;
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
