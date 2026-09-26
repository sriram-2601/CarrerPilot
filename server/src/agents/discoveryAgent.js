import { env } from '../config/env.js';
import { extractSkills } from '../utils/text.js';
import { seedInternships } from '../data/seedInternships.js';
import { curatedCatalog } from '../data/catalog.js';

export async function discoverInternships(profile = null) {
  const hasSignal = profile && (
    (profile.skills && profile.skills.length > 0) ||
    (profile.preferences?.roles && profile.preferences.roles.length > 0) ||
    (profile.resumeText && profile.resumeText.length > 30)
  );

  // If no signal, return seed internships
  if (!hasSignal) {
    return seedInternships.slice(0, 5);
  }

  let liveResults = [];

  // Best-effort live Remotive fetch if enabled
  if (env.ENABLE_LIVE_DISCOVERY) {
    try {
      const searchTerm = (profile.preferences?.roles?.[0] || profile.skills?.[0] || 'intern').toLowerCase();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=40`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          liveResults = data.jobs
            .filter(job => isEarlyCareer(job.title, job.description))
            .map(job => {
              const skillsRequired = extractSkills(`${job.title} ${job.description}`);
              return {
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description).slice(0, 500),
                skillsRequired: skillsRequired.length > 0 ? skillsRequired : ['JavaScript', 'HTML', 'CSS', 'Git'],
                location: job.candidate_required_location || 'Remote',
                applyLink: job.url,
                source: 'Remotive (live)',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              };
            });
        }
      }
    } catch (err) {
      // Live discovery failure is swallowed and falls back to curated catalog
      liveResults = [];
    }
  }

  // Combine curated catalog + live results
  const combined = [...curatedCatalog, ...liveResults];

  // Deduplicate by company + title
  const seen = new Set();
  const deduped = [];
  for (const item of combined) {
    const key = `${(item.company || '').toLowerCase()}::${(item.title || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  // Rank by relevanceScore = (skill overlap)*2 + (preferred-role hit)*2 + (location hit)
  const candidateSkills = new Set((profile.skills || []).map(s => s.toLowerCase()));
  const preferredRoles = (profile.preferences?.roles || []).map(r => r.toLowerCase());
  const preferredLocation = (profile.preferences?.location || '').toLowerCase();

  const scored = deduped.map(item => {
    let skillOverlap = 0;
    for (const req of (item.skillsRequired || [])) {
      if (candidateSkills.has(req.toLowerCase())) {
        skillOverlap++;
      }
    }

    let roleHit = 0;
    const lowerTitle = (item.title || '').toLowerCase();
    for (const role of preferredRoles) {
      if (lowerTitle.includes(role)) {
        roleHit = 1;
        break;
      }
    }

    let locationHit = 0;
    const itemLoc = (item.location || '').toLowerCase();
    if (itemLoc.includes('remote') || (preferredLocation && itemLoc.includes(preferredLocation))) {
      locationHit = 1;
    }

    const relevanceScore = (skillOverlap * 2) + (roleHit * 2) + locationHit;
    return { item, relevanceScore };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const top10 = scored.slice(0, 10).map(s => s.item);
  return top10.length > 0 ? top10 : seedInternships.slice(0, 5);
}

function isEarlyCareer(title = '', desc = '') {
  const combined = `${title} ${desc}`.toLowerCase();
  return /intern|junior|entry|fellow|associate|apprentice|co-op/i.test(combined);
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}
