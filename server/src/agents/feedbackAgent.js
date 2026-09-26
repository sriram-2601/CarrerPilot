export function buildAnalytics(applications = [], matches = [], profile = null) {
  const total = applications.length;

  const statusCounts = {
    SAVED: 0,
    PREPARING: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0
  };

  applications.forEach(app => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  });

  const appliedOrBeyond = statusCounts.APPLIED + statusCounts.INTERVIEW + statusCounts.OFFER + statusCounts.REJECTED;
  const interviewOrBeyond = statusCounts.INTERVIEW + statusCounts.OFFER;
  const offerCount = statusCounts.OFFER;

  const interviewRate = appliedOrBeyond > 0 ? Math.round((interviewOrBeyond / appliedOrBeyond) * 100) : 0;
  const offerRate = interviewOrBeyond > 0 ? Math.round((offerCount / interviewOrBeyond) * 100) : 0;

  // Match score effectiveness: avg match score of progressed applications
  let progressedMatchScoreSum = 0;
  let progressedMatchCount = 0;

  const matchMap = new Map();
  matches.forEach(m => matchMap.set(String(m.internshipId), m.score || 0));

  applications.forEach(app => {
    if (app.status === 'INTERVIEW' || app.status === 'OFFER' || app.status === 'APPLIED') {
      const score = matchMap.get(String(app.internshipId));
      if (score !== undefined) {
        progressedMatchScoreSum += score;
        progressedMatchCount++;
      }
    }
  });

  const avgProgressedMatchScore = progressedMatchCount > 0
    ? Math.round(progressedMatchScoreSum / progressedMatchCount)
    : 0;

  // Top performing skills
  const skillOccurrences = new Map();
  matches.forEach(m => {
    (m.matchedSkills || []).forEach(skill => {
      skillOccurrences.set(skill, (skillOccurrences.get(skill) || 0) + 1);
    });
  });

  const topPerformingSkills = Array.from(skillOccurrences.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Strategic recommendation note
  let recommendationNote = '';
  if (total === 0) {
    recommendationNote = 'Start by exploring recommended internships and clicking Match to calculate compatibility scores.';
  } else if (appliedOrBeyond === 0) {
    recommendationNote = 'You have saved opportunities! Generate tailored resumes for your highest matches and submit your first applications.';
  } else if (interviewRate >= 25) {
    recommendationNote = 'Strong pipeline momentum! Your skill alignment is converting into interviews. Continue preparing for upcoming technical rounds.';
  } else {
    recommendationNote = 'Focus your applications on opportunities with a 75%+ match score and review the Skill-Gap plan to address missing requirements.';
  }

  return {
    totalApplications: total,
    statusCounts,
    appliedCount: appliedOrBeyond,
    interviewCount: interviewOrBeyond,
    offerCount,
    interviewRate,
    offerRate,
    avgProgressedMatchScore,
    topPerformingSkills,
    recommendationNote
  };
}
