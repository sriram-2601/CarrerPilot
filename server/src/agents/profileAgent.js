import pdf from 'pdf-parse';
import { extractSkills, summarizeText, generateEmbeddingFallback } from '../utils/text.js';
import { generateLocalText, generateEmbedding } from '../services/ollamaService.js';

export async function parseResume(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid or missing PDF resume file buffer');
  }

  const uint8 = Buffer.isBuffer(buffer) ? new Uint8Array(buffer) : buffer;
  const pdfData = await pdf(uint8);
  const resumeText = (pdfData && pdfData.text) ? pdfData.text.trim() : '';

  if (!resumeText || resumeText.length < 30) {
    throw new Error('Extracted resume text is under 30 characters or unreadable');
  }

  // 1. Extract skills using canonical knownSkills list
  const skills = extractSkills(resumeText);

  // 2. Extract summary via Ollama with deterministic fallback
  let summary = '';
  try {
    const prompt = `Summarize this candidate resume in 2 concise sentences emphasizing their technical skills and background:\n\n${resumeText.slice(0, 1500)}`;
    summary = await generateLocalText(prompt);
  } catch (err) {
    summary = '';
  }
  if (!summary || summary.trim() === '') {
    summary = summarizeText(resumeText);
  }

  // 3. Line scanning for structured sections
  const { projects, experience, education } = parseStructuredSections(resumeText);

  // 4. Compute embedding via Ollama with deterministic fallback
  let embedding = [];
  try {
    embedding = await generateEmbedding(resumeText.slice(0, 2000));
  } catch (err) {
    embedding = [];
  }
  if (!embedding || embedding.length === 0) {
    embedding = generateEmbeddingFallback(resumeText);
  }

  return {
    resumeText,
    skills,
    summary,
    projects,
    experience,
    education,
    embedding
  };
}

function parseStructuredSections(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projects = [];
  const experience = [];
  const education = [];

  let currentSection = null;
  let currentBlock = [];

  const flushBlock = () => {
    if (currentBlock.length === 0) return;
    const content = currentBlock.join(' ');

    if (currentSection === 'projects') {
      const title = currentBlock[0] || 'Project';
      const desc = currentBlock.slice(1).join(' ') || title;
      projects.push({
        title: title.slice(0, 60),
        description: desc.slice(0, 300),
        technologies: extractSkills(content)
      });
    } else if (currentSection === 'experience') {
      const roleLine = currentBlock[0] || 'Intern';
      experience.push({
        company: roleLine.split(/[,-|]/)[1]?.trim() || 'Company',
        role: roleLine.split(/[,-|]/)[0]?.trim() || 'Role',
        duration: 'Recent',
        description: currentBlock.slice(1).join(' ').slice(0, 300) || roleLine
      });
    } else if (currentSection === 'education') {
      education.push({
        institution: currentBlock[0]?.slice(0, 80) || 'University',
        degree: currentBlock[1]?.slice(0, 60) || 'Degree',
        year: 'Recent'
      });
    }

    currentBlock = [];
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^(projects|technical projects|academic projects)/i.test(lower)) {
      flushBlock();
      currentSection = 'projects';
    } else if (/^(experience|work experience|employment|internships)/i.test(lower)) {
      flushBlock();
      currentSection = 'experience';
    } else if (/^(education|academic background|academics)/i.test(lower)) {
      flushBlock();
      currentSection = 'education';
    } else if (/^(skills|technical skills|awards|certifications|summary|objective)/i.test(lower)) {
      flushBlock();
      currentSection = null;
    } else if (currentSection) {
      if (line.length > 3) {
        currentBlock.push(line);
        if (currentBlock.length >= 3) {
          flushBlock();
        }
      }
    }
  }
  flushBlock();

  return { projects, experience, education };
}
