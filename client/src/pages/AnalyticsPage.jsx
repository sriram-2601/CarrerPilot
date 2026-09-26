import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useAnalytics } from '../api/queries.js';
import { MetricCard } from '../components/MetricCard.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return <LoadingState message="Computing Feedback Agent outcome analytics..." />;
  }

  const total = analytics?.totalApplications || 0;
  const statusCounts = analytics?.statusCounts || {};
  const topSkills = analytics?.topPerformingSkills || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
          Analytics & Feedback Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Outcome metrics, application conversion funnel, and skill performance telemetry.
        </p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tracked Applications"
          value={total}
          subtext="Applications across all stages"
          icon={BarChart3}
          color="ink"
        />
        <MetricCard
          title="Interview Conversion"
          value={`${analytics?.interviewRate || 0}%`}
          subtext={`${analytics?.interviewCount || 0} reached interview stage`}
          icon={TrendingUp}
          color="moss"
        />
        <MetricCard
          title="Offer Rate"
          value={`${analytics?.offerRate || 0}%`}
          subtext={`${analytics?.offerCount || 0} received internship offers`}
          icon={Award}
          color="gold"
        />
        <MetricCard
          title="Avg Progressed Fit"
          value={analytics?.avgProgressedMatchScore ? `${analytics.avgProgressedMatchScore}%` : 'N/A'}
          subtext="Match score for active applications"
          icon={Zap}
          color="blue"
        />
      </div>

      {/* Strategic Recommendation Callout */}
      <div className="bg-white rounded-3xl border border-moss/30 p-6 sm:p-8 shadow-soft bg-gradient-to-br from-white to-moss/5 space-y-3">
        <div className="flex items-center gap-2 text-moss font-bold text-sm uppercase tracking-wider">
          <Lightbulb className="w-5 h-5 text-gold-dark" />
          Feedback Agent Strategic Recommendation
        </div>
        <p className="text-base sm:text-lg font-semibold text-ink-900 leading-relaxed">
          "{analytics?.recommendationNote}"
        </p>
      </div>

      {/* Two Column Layout: Application Funnel & Top Performing Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Stage Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-moss" />
            Application Stage Distribution
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Saved Opportunities', key: 'SAVED', color: 'bg-slate-400' },
              { label: 'Preparing Tailored Resume', key: 'PREPARING', color: 'bg-gold' },
              { label: 'Applied to Company', key: 'APPLIED', color: 'bg-moss' },
              { label: 'Interview Scheduled', key: 'INTERVIEW', color: 'bg-blue-500' },
              { label: 'Offer Received 🎉', key: 'OFFER', color: 'bg-emerald-500' },
              { label: 'Rejected', key: 'REJECTED', color: 'bg-coral' }
            ].map((stage) => {
              const count = statusCounts[stage.key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={stage.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-700">
                    <span>{stage.label}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Performing Skills Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-dark" />
            Top-Performing Skills in Pipeline
          </h2>
          <p className="text-xs text-ink-500">
            Skills with the highest frequency across your matched and active opportunities.
          </p>

          {topSkills.length === 0 ? (
            <p className="text-xs text-ink-400 py-6 text-center">
              Generate match scores on the Dashboard to see your highest-converting skills.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topSkills.map((item, idx) => (
                <div
                  key={item.skill}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-moss/10 text-moss flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-ink-900">{item.skill}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-ink-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {item.count} opportunities
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
