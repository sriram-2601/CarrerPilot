import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText,
  Settings,
  History,
  Briefcase,
  GraduationCap,
  FolderGit2,
  CheckCircle2,
  Clock,
  Save,
  AlertCircle
} from 'lucide-react';
import { useProfile, useResumeHistory, useUpdatePreferences } from '../api/queries.js';
import { ResumeUploadCard } from '../components/ResumeUploadCard.jsx';
import { Button } from '../components/Button.jsx';
import { Field } from '../components/Field.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

export function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: history = [], isLoading: historyLoading } = useResumeHistory();
  const updatePreferencesMutation = useUpdatePreferences();

  const [saveSuccess, setSaveSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    values: {
      roles: profile?.preferences?.roles?.join(', ') || '',
      location: profile?.preferences?.location || '',
      workMode: profile?.preferences?.workMode || 'any',
      stipendRange: profile?.preferences?.stipendRange || ''
    }
  });

  const onSavePreferences = async (data) => {
    setSaveSuccess(false);
    const rolesArray = data.roles
      ? data.roles.split(',').map((r) => r.trim()).filter(Boolean)
      : [];

    await updatePreferencesMutation.mutateAsync({
      roles: rolesArray,
      location: data.location,
      workMode: data.workMode,
      stipendRange: data.stipendRange
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (profileLoading) {
    return <LoadingState message="Loading candidate profile..." />;
  }

  const projects = profile?.projects || [];
  const experience = profile?.experience || [];
  const education = profile?.education || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
          Candidate Profile & Resume
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Single source of truth: Manage your PDF resume, target preferences, and view archived runs.
        </p>
      </div>

      {/* 1. Resume Upload Card */}
      <ResumeUploadCard profile={profile} />

      {/* 2. Candidate Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-moss" />
              Target Preferences
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Used by Discovery & Matching agents to compute role & location boosts
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Preferences saved
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSavePreferences)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Target Roles" helper="Separate roles by commas (e.g. Frontend Developer, Full Stack Engineer)">
              <input
                type="text"
                placeholder="Frontend Developer, Software Engineer Intern"
                {...register('roles')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
              />
            </Field>

            <Field label="Preferred Location" helper="City, State or Remote">
              <input
                type="text"
                placeholder="Remote, San Francisco, New York"
                {...register('location')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
              />
            </Field>

            <Field label="Work Mode">
              <select
                {...register('workMode')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss bg-white"
              >
                <option value="any">Any Work Mode</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </Field>

            <Field label="Stipend Expectation" helper="e.g. $30 - $50 / hr">
              <input
                type="text"
                placeholder="$25 - $45 / hr"
                {...register('stipendRange')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              icon={Save}
              loading={updatePreferencesMutation.isPending}
            >
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Extracted Structured Blocks (Projects, Experience, Education) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <FolderGit2 className="w-4 h-4 text-moss" />
            Extracted Projects ({projects.length})
          </h3>
          {projects.length === 0 ? (
            <p className="text-xs text-ink-400 py-3">No distinct projects parsed.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {projects.map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                  <p className="font-bold text-ink-900">{p.title}</p>
                  <p className="text-ink-600 line-clamp-3">{p.description}</p>
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technologies.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-ink-700 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-moss" />
            Extracted Experience ({experience.length})
          </h3>
          {experience.length === 0 ? (
            <p className="text-xs text-ink-400 py-3">No prior employment parsed.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {experience.map((e, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink-900">{e.role}</p>
                    <span className="text-[10px] text-ink-400">{e.duration}</span>
                  </div>
                  <p className="font-semibold text-ink-700">{e.company}</p>
                  <p className="text-ink-600 line-clamp-3">{e.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-moss" />
            Extracted Education ({education.length})
          </h3>
          {education.length === 0 ? (
            <p className="text-xs text-ink-400 py-3">No education entries parsed.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {education.map((ed, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink-900">{ed.degree}</p>
                    <span className="text-[10px] text-ink-400">{ed.year}</span>
                  </div>
                  <p className="font-semibold text-ink-700">{ed.institution}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Resume History Log (Archived Runs) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-ink-700" />
              Resume History & Superseded Runs Log
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Audit log of prior resumes archived on upload (never displayed on dashboard)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-ink-700">
            {history.length} Archived Run{history.length !== 1 ? 's' : ''}
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-ink-400 text-center py-6">
            No previous resume runs archived yet. When you upload a newer resume, the current one will be saved here.
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-900">{item.label}</span>
                    <span className="text-[11px] text-ink-400">
                      (Superseded {new Date(item.supersededAt).toLocaleDateString()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-600">
                    <span>Matches: <b>{item.matchCount}</b></span>
                    <span>•</span>
                    <span>High Fit (&gt;=75%): <b>{item.highMatchCount}</b></span>
                    <span>•</span>
                    <span>Versions: <b>{item.resumeVersionCount}</b></span>
                  </div>
                </div>

                {item.summary && (
                  <p className="text-xs text-ink-600 italic">"{item.summary}"</p>
                )}

                {item.skills && item.skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                      Skills Snapshot:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.skills.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white text-ink-700 border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.topMatches && item.topMatches.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                      Top Scored Matches at Archival:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.topMatches.map((tm, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200/70 text-[11px]">
                          <p className="font-bold text-ink-900 truncate">{tm.title}</p>
                          <p className="text-ink-500 truncate">{tm.company}</p>
                          <span className="font-semibold text-moss mt-0.5 inline-block">{tm.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
