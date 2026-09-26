import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Kanban,
  Bell,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Target,
  Briefcase
} from 'lucide-react';
import {
  useProfile,
  useInternships,
  useMatches,
  useResumeVersions,
  useApplications,
  useNotifications,
  useSyncInternships,
  useGenerateMatches
} from '../api/queries.js';
import { MetricCard } from '../components/MetricCard.jsx';
import { WorkflowGraph } from '../components/WorkflowGraph.jsx';
import { Button } from '../components/Button.jsx';
import { StatusPill } from '../components/StatusPill.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

export function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: internships = [], isLoading: internshipsLoading } = useInternships();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: resumeVersions = [] } = useResumeVersions();
  const { data: applications = [] } = useApplications();
  const { data: notifications = [] } = useNotifications();

  const syncMutation = useSyncInternships();
  const matchMutation = useGenerateMatches();

  const highMatchCount = matches.filter((m) => (m.score || 0) >= 75).length;
  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  if (profileLoading && internshipsLoading) {
    return <LoadingState message="Connecting to agent pipeline..." />;
  }

  // Enrich top internships with user matches
  const matchMap = new Map();
  matches.forEach((m) => matchMap.set(String(m.internshipId), m));

  const rankedInternships = [...internships]
    .map((item) => {
      const match = matchMap.get(String(item._id));
      return {
        ...item,
        score: match ? match.score : -1,
        matchReason: match?.reason || ''
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const hasResume = Boolean(profile?.resumeText && profile.resumeText.length >= 30);

  return (
    <div className="space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Student Career Console
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Cooperating AI agents orchestrating your internship search, tailoring, and applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={() => syncMutation.mutate()}
            loading={syncMutation.isPending}
            title="Rank catalog and live postings against your profile"
          >
            Sync Discovery
          </Button>

          <Button
            variant="primary"
            icon={Sparkles}
            size="sm"
            onClick={() => matchMutation.mutate()}
            loading={matchMutation.isPending}
            disabled={!hasResume}
            title={hasResume ? 'Score all internships against your resume' : 'Upload a resume in Profile first'}
          >
            Calculate Matches
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Discovered Internships"
          value={internships.length}
          subtext="Curated catalog & live feed"
          icon={Compass}
          color="ink"
        />
        <MetricCard
          title="High Fit Matches (>=75%)"
          value={highMatchCount}
          subtext={matches.length > 0 ? `${matches.length} total scored` : 'Run Match to calculate'}
          icon={Target}
          color="moss"
        />
        <MetricCard
          title="Tracked Applications"
          value={applications.length}
          subtext="Kanban pipeline stages"
          icon={Kanban}
          color="gold"
        />
        <MetricCard
          title="Unread Alerts"
          value={unreadAlertsCount}
          subtext="Stage & action updates"
          icon={Bell}
          color="coral"
        />
      </div>

      {/* Live Reactive Workflow Graph */}
      <WorkflowGraph
        profile={profile}
        internships={internships}
        matches={matches}
        resumeVersions={resumeVersions}
        applications={applications}
        notifications={notifications}
      />

      {/* Two Column Layout: Ranked Opportunities & Profile Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Ranked Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900 tracking-tight">
                Top Matched Opportunities
              </h2>
              <p className="text-xs text-ink-500">
                Ranked by Profile Agent skills overlap & role preferences
              </p>
            </div>
            <Link
              to="/internships"
              className="text-xs font-bold text-moss hover:underline flex items-center gap-1"
            >
              Explore All ({internships.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {rankedInternships.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-ink-500 space-y-2">
                <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-ink-700">No opportunities discovered yet.</p>
                <p>Click "Sync Discovery" to rank internships against your profile.</p>
              </div>
            ) : (
              rankedInternships.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-soft hover:shadow-elevated transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                        {job.company}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-ink-500">{job.location}</span>
                      {job.source && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-ink-600">
                          {job.source}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/internships/${job._id}`}
                      className="text-sm font-bold text-ink-900 hover:text-moss truncate block"
                    >
                      {job.title}
                    </Link>

                    {job.matchReason && (
                      <p className="text-xs text-ink-600 line-clamp-1 italic">
                        "{job.matchReason}"
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(job.skillsRequired || []).slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-ink-700"
                        >
                          {s}
                        </span>
                      ))}
                      {(job.skillsRequired || []).length > 4 && (
                        <span className="text-[10px] text-ink-400 self-center">
                          +{job.skillsRequired.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Pill & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {job.score >= 0 ? (
                      <div className="text-center sm:text-right">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1 ${
                            job.score >= 75
                              ? 'bg-moss text-white'
                              : job.score >= 50
                              ? 'bg-gold text-white'
                              : 'bg-slate-200 text-ink-700'
                          }`}
                        >
                          {job.score}% Match
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-ink-400 font-medium">Unscored</span>
                    )}

                    <Link
                      to={`/internships/${job._id}`}
                      className="text-xs font-bold text-moss hover:bg-moss/10 px-3 py-1.5 rounded-lg transition-colors border border-moss/20"
                    >
                      View & Tailor
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Profile Snapshot & Tracker Preview */}
        <div className="space-y-6">
          {/* Profile Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-moss" />
                Current Resume Profile
              </h3>
              <Link to="/profile" className="text-xs font-bold text-moss hover:underline">
                Edit
              </Link>
            </div>

            {hasResume ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1.5">
                    Extracted Skills ({profile.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(profile.skills || []).slice(0, 10).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-ink-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {(profile.skills || []).length > 10 && (
                      <span className="text-[11px] text-ink-400 self-center">
                        +{profile.skills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {profile.preferences?.roles && profile.preferences.roles.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                      Preferred Roles
                    </span>
                    <p className="text-xs font-medium text-ink-700">
                      {profile.preferences.roles.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-ink-500">No active resume uploaded yet.</p>
                <Link to="/profile">
                  <Button size="sm" variant="primary">
                    Upload PDF Resume
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Tracker Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                <Kanban className="w-4 h-4 text-gold-dark" />
                Application Pipeline
              </h3>
              <Link to="/tracker" className="text-xs font-bold text-moss hover:underline">
                View Kanban
              </Link>
            </div>

            {applications.length === 0 ? (
              <p className="text-xs text-ink-400 text-center py-3">
                No applications in tracker yet. Explore matches to begin tracking!
              </p>
            ) : (
              <div className="space-y-2.5">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-ink-900 truncate">
                        {app.internship?.title || 'Internship'}
                      </p>
                      <p className="text-[11px] text-ink-500 truncate">
                        {app.internship?.company || 'Company'}
                      </p>
                    </div>
                    <StatusPill status={app.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
