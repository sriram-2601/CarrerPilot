import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  useInternships,
  useMatches,
  useSyncInternships,
  useGenerateMatches,
  useCreateOrProgressApplication
} from '../api/queries.js';
import { Button } from '../components/Button.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

export function InternshipsPage() {
  const { data: internships = [], isLoading } = useInternships();
  const { data: matches = [] } = useMatches();
  const syncMutation = useSyncInternships();
  const matchMutation = useGenerateMatches();
  const applyMutation = useCreateOrProgressApplication();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [appliedNotice, setAppliedNotice] = useState('');

  // Map matches to internship IDs
  const matchMap = new Map();
  matches.forEach((m) => matchMap.set(String(m.internshipId), m));

  const enriched = internships.map((job) => {
    const match = matchMap.get(String(job._id));
    return {
      ...job,
      score: match ? match.score : -1,
      matchedSkills: match?.matchedSkills || [],
      missingSkills: match?.missingSkills || [],
      reason: match?.reason || ''
    };
  });

  // Filter & Search
  const filtered = enriched.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skillsRequired || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'LIVE' && job.source?.includes('Remotive')) ||
      (sourceFilter === 'SEED' && job.source === 'seed') ||
      (sourceFilter === 'CATALOG' && job.source === 'catalog');

    return matchesSearch && matchesSource;
  });

  // Sort score descending by default
  filtered.sort((a, b) => b.score - a.score);

  const handleApplyClick = async (job) => {
    try {
      await applyMutation.mutateAsync({
        internshipId: job._id,
        status: 'APPLIED',
        notes: `Applied on company site (${job.company})`
      });
      setAppliedNotice(`Application recorded for ${job.title}! Opening portal...`);
      setTimeout(() => setAppliedNotice(''), 4000);
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <LoadingState message="Discovering and ranking internships..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Internship Explorer
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Discover opportunities ranked against your candidate profile, review matches, and apply.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={() => syncMutation.mutate()}
            loading={syncMutation.isPending}
          >
            Sync Discovery Feed
          </Button>

          <Button
            variant="primary"
            icon={Sparkles}
            size="sm"
            onClick={() => matchMutation.mutate()}
            loading={matchMutation.isPending}
          >
            Recalculate Matches
          </Button>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by title, company, or technical skill (e.g. React, Python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-ink-400 shrink-0" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-moss/30 bg-white"
          >
            <option value="ALL">All Sources ({enriched.length})</option>
            <option value="LIVE">Live Feed (Remotive)</option>
            <option value="CATALOG">Curated Catalog</option>
            <option value="SEED">Foundational Seeds</option>
          </select>
        </div>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-ink-500 space-y-2">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-ink-700">No internships matched your search criteria.</p>
            <p>Try resetting filters or click "Sync Discovery Feed" to query fresh opportunities.</p>
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-ink-700 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-moss" />
                    {job.company}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-ink-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-ink-400" />
                    {job.location}
                  </span>
                  {job.source && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-ink-600">
                      {job.source}
                    </span>
                  )}
                </div>

                <Link
                  to={`/internships/${job._id}`}
                  className="text-base font-bold text-ink-900 hover:text-moss truncate block"
                >
                  {job.title}
                </Link>

                <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {job.reason && (
                  <p className="text-xs text-ink-600 italic border-l-2 border-moss/60 pl-2.5">
                    Match Analysis: {job.reason}
                  </p>
                )}

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(job.skillsRequired || []).map((skill) => {
                    const isMatched = (job.matchedSkills || []).some(
                      (m) => m.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          isMatched
                            ? 'bg-moss/10 text-moss border-moss/20'
                            : 'bg-slate-50 text-ink-600 border-slate-200'
                        }`}
                      >
                        {skill} {isMatched && '✓'}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Score & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                <div className="text-left md:text-right">
                  {job.score >= 0 ? (
                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-sm ${
                        job.score >= 75
                          ? 'bg-moss text-white'
                          : job.score >= 50
                          ? 'bg-gold text-white'
                          : 'bg-slate-200 text-ink-700'
                      }`}
                    >
                      {job.score}% Match
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400 font-medium">Unscored</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/internships/${job._id}`}>
                    <Button variant="outline" size="sm">
                      Details & Tailor
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => handleApplyClick(job)}
                    title="Records APPLIED on your Kanban board and opens application URL"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
