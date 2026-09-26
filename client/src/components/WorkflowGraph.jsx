import React, { useState } from 'react';
import {
  FileText,
  Compass,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Kanban,
  BarChart3,
  Bell,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowDown
} from 'lucide-react';

export function WorkflowGraph({
  profile,
  internships = [],
  matches = [],
  resumeVersions = [],
  applications = [],
  notifications = []
}) {
  const [showArchitectureDetails, setShowArchitectureDetails] = useState(false);

  const stages = [
    {
      id: 'profile',
      number: '01',
      name: 'Profile Agent',
      icon: FileText,
      active: Boolean(profile?.resumeText && profile.resumeText.length >= 30),
      description: 'PDF parsed into candidate facts & verified skills',
      input: 'PDF Resume File (multipart)',
      output: 'Structured Profile, Skills Array, Embedding Vector',
      fallback: 'Deterministic regex & keyword tokenizer'
    },
    {
      id: 'discovery',
      number: '02',
      name: 'Discovery Agent',
      icon: Compass,
      active: Boolean(internships && internships.length > 0),
      description: 'Catalog & live feed ranked by profile signal',
      input: 'Candidate skills & preferred target roles',
      output: 'Top 10 Ranked Internship Opportunities',
      fallback: 'Foundational 5 seed internships'
    },
    {
      id: 'matching',
      number: '03',
      name: 'Matching Agent',
      icon: CheckCircle2,
      active: Boolean(matches && matches.length > 0),
      description: '80-pt skill formula + role/location boosts',
      input: 'Profile skills + Internship required skills',
      output: 'Match Score (0-100%) + Matched/Missing breakdown',
      fallback: 'Exact formula with deterministic rationale generator'
    },
    {
      id: 'skillgap',
      number: '04',
      name: 'Skill-Gap Agent',
      icon: AlertTriangle,
      active: Boolean(matches && matches.some((m) => m.missingSkills && m.missingSkills.length > 0)),
      description: 'Prioritized study action plans & mini-projects',
      input: 'Missing skills from Matching Agent',
      output: 'Prioritized Study Plan & Portfolio Projects',
      fallback: 'Curated technical roadmap database'
    },
    {
      id: 'preparation',
      number: '05',
      name: 'Preparation Agent',
      icon: FileCode2,
      active: Boolean(resumeVersions && resumeVersions.length > 0),
      description: 'Skills-only re-ordering with zero fabrication',
      input: 'Target job required skills + Candidate real skills',
      output: 'Tailored Resume + Honest Change Summary',
      fallback: 'Zero-hallucination keyword priority sorter'
    },
    {
      id: 'tracker',
      number: '06',
      name: 'Tracker Agent',
      icon: Kanban,
      active: Boolean(applications && applications.length > 0),
      description: '6-column Kanban with upward progression',
      input: 'Student actions & application milestones',
      output: 'Enforced status progression & deadline calendar',
      fallback: 'Strict STATUS_RANK validation engine'
    },
    {
      id: 'feedback',
      number: '07',
      name: 'Feedback Agent',
      icon: BarChart3,
      active: Boolean(applications && applications.some((a) => ['APPLIED', 'INTERVIEW', 'OFFER'].includes(a.status))),
      description: 'Outcome conversion funnel & top skills',
      input: 'All historical applications & outcome statuses',
      output: 'Conversion rates & Strategic recommendations',
      fallback: 'Statistical conversion analysis engine'
    },
    {
      id: 'notification',
      number: '08',
      name: 'Notification Agent',
      icon: Bell,
      active: Boolean(notifications && notifications.length > 0),
      description: 'Milestones & action reminders raised',
      input: 'Stage transitions & scheduled node-cron scans',
      output: 'Actionable in-app alerts & follow-up reminders',
      fallback: 'Direct in-memory notification queue'
    }
  ];

  const activeCount = stages.filter((s) => s.active).length;
  const totalCount = stages.length;
  const progressPct = Math.round((activeCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-moss" />
              Live Workflow Automation Graph
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-moss bg-moss-subtle px-2.5 py-0.5 rounded-full border border-moss/20">
              <Sparkles className="w-3 h-3" />
              Real-time Reactive
            </span>
          </div>
          <p className="text-xs text-ink-500">
            Cooperating multi-agent pipeline advancing stage by stage as actual student work completes
          </p>
        </div>

        {/* Progress Badge & Details Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900 text-white shadow-sm">
              <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-bold tracking-wide">
                {activeCount} / {totalCount} Stages Active ({progressPct}%)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowArchitectureDetails(!showArchitectureDetails)}
            className="text-xs font-semibold text-ink-600 hover:text-ink-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-moss" />
            <span>{showArchitectureDetails ? 'Hide Flow' : 'Agent Specs'}</span>
            {showArchitectureDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Graphical Pipeline Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-400">
          <span>End-to-End Orchestration Velocity</span>
          <span className="text-moss font-bold">{progressPct}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-moss-light to-moss transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${Math.max(5, progressPct)}%` }}
          />
        </div>
      </div>

      {/* Graphical Pipeline Sequence (Desktop Connecting Line & Stage Cards) */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = stage.active;

            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-white to-moss/5 border-moss/50 shadow-md ring-1 ring-moss/20 scale-[1.01]'
                    : 'bg-slate-50/50 border-slate-200/80 opacity-60'
                }`}
              >
                {/* Stage Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
                      Step {stage.number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-moss text-white shadow-xs'
                          : 'bg-slate-200 text-ink-500'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Live Active
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          Waiting
                        </>
                      )}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5 mt-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isActive
                          ? 'bg-moss text-white shadow-soft scale-105'
                          : 'bg-slate-200 text-ink-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-ink-900 leading-tight">
                        {stage.name}
                      </h3>
                      <span className="text-[10px] text-moss font-semibold block mt-0.5">
                        {isActive ? 'Signal Detected' : 'Pending Action'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-[11px] text-ink-600 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Micro Visual Flow Indicator */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-ink-400">
                  <span>Deterministic Fallback</span>
                  <span className="font-semibold text-ink-700">Ready ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Agent Architecture Specs & Data Contracts */}
      {showArchitectureDetails && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-moss" />
              Agent Data Contract & Fallback Specifications
            </span>
            <span className="text-[11px] text-ink-500">Spec-File Guaranteed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {stages.map((st) => (
              <div key={st.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <p className="font-bold text-ink-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-moss shrink-0" />
                  {st.name}
                </p>
                <div className="text-[11px] space-y-1 text-ink-600">
                  <p><b className="text-ink-800">Input:</b> {st.input}</p>
                  <p><b className="text-ink-800">Output:</b> {st.output}</p>
                  <p className="text-[10px] text-moss-dark bg-moss/5 p-1 rounded font-medium">
                    <b>Fallback:</b> {st.fallback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
