import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  Building,
  Calendar,
  Save,
  Trash2,
  ExternalLink,
  Plus,
  AlertCircle
} from 'lucide-react';
import {
  useApplications,
  useUpdateApplication,
  useDeleteApplication
} from '../api/queries.js';
import { StatusPill } from '../components/StatusPill.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

const COLUMNS = [
  { id: 'SAVED', title: 'Saved', color: 'border-slate-300' },
  { id: 'PREPARING', title: 'Preparing', color: 'border-amber-300' },
  { id: 'APPLIED', title: 'Applied', color: 'border-emerald-300' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-blue-300' },
  { id: 'OFFER', title: 'Offer', color: 'border-green-400' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-300' }
];

export function TrackerPage() {
  const { data: applications = [], isLoading } = useApplications();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const [activeNotes, setActiveNotes] = useState({});
  const [activeDates, setActiveDates] = useState({});
  const [savedFeedbacks, setSavedFeedbacks] = useState({});

  if (isLoading) {
    return <LoadingState message="Loading Kanban tracking board..." />;
  }

  const handleNotesChange = (appId, val) => {
    setActiveNotes((prev) => ({ ...prev, [appId]: val }));
  };

  const handleDateChange = (appId, val) => {
    setActiveDates((prev) => ({ ...prev, [appId]: val }));
  };

  const handleSaveCard = async (app) => {
    const notes = activeNotes[app._id] !== undefined ? activeNotes[app._id] : app.notes;
    const nextActionDate = activeDates[app._id] !== undefined ? activeDates[app._id] : app.nextActionDate;

    await updateMutation.mutateAsync({
      id: app._id,
      notes,
      nextActionDate
    });

    setSavedFeedbacks((prev) => ({ ...prev, [app._id]: true }));
    setTimeout(() => {
      setSavedFeedbacks((prev) => ({ ...prev, [app._id]: false }));
    }, 2500);
  };

  const handleStatusChange = async (app, newStatus) => {
    await updateMutation.mutateAsync({
      id: app._id,
      status: newStatus
    });
  };

  const handleDelete = async (app) => {
    const confirmed = window.confirm(
      `Remove application for "${app.internship?.title || 'Internship'}" at "${app.internship?.company || 'Company'}"?`
    );
    if (confirmed) {
      await deleteMutation.mutateAsync(app._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Application Kanban Tracker
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Enforce upward application progression, track deadlines, and log recruiter feedback.
          </p>
        </div>

        <Link to="/internships">
          <Button variant="primary" size="sm" icon={Plus}>
            Track New Opportunity
          </Button>
        </Link>
      </div>

      {/* Graphical Progression Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft">
        <div className="flex items-center justify-between text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">
          <span>Upward Pipeline Lifecycle</span>
          <span className="text-moss font-bold">{applications.length} Total Tracked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {COLUMNS.map((col, idx) => {
            const count = applications.filter((a) => a.status === col.id).length;
            return (
              <div
                key={col.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-400">STAGE 0{idx + 1}</span>
                  <span className="text-xs font-bold text-ink-900 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {count}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-800">{col.title}</span>
                  <span className="text-slate-300">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-white/80 rounded-2xl border border-slate-200/90 p-4 shadow-soft flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-900">{col.title}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-ink-600">
                    {colApps.length}
                  </span>
                </div>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colApps.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-center p-3 text-[11px] text-ink-400">
                    No applications
                  </div>
                ) : (
                  colApps.map((app) => {
                    const currentNote =
                      activeNotes[app._id] !== undefined ? activeNotes[app._id] : app.notes || '';
                    const currentDate =
                      activeDates[app._id] !== undefined
                        ? activeDates[app._id]
                        : app.nextActionDate
                        ? new Date(app.nextActionDate).toISOString().split('T')[0]
                        : '';

                    return (
                      <div
                        key={app._id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-all space-y-2.5 text-xs"
                      >
                        {/* Title & Company */}
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[11px] font-bold text-moss uppercase tracking-wider truncate">
                              {app.internship?.company || 'Company'}
                            </span>
                            <button
                              onClick={() => handleDelete(app)}
                              title="Delete application"
                              className="text-slate-300 hover:text-coral transition-colors p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Link
                            to={`/internships/${app.internshipId}`}
                            className="font-bold text-ink-900 hover:text-moss line-clamp-2 block mt-0.5"
                          >
                            {app.internship?.title || 'Internship Role'}
                          </Link>
                        </div>

                        {/* Match score if present */}
                        {app.matchScore && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-ink-400">Fit score:</span>
                            <span className="font-bold text-moss">{app.matchScore}%</span>
                          </div>
                        )}

                        {/* Status Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            Status
                          </label>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app, e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-moss bg-white"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>

                        {/* Next Action Date */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            Next Action Date
                          </label>
                          <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => handleDateChange(app._id, e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-moss"
                          />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            Notes & Context
                          </label>
                          <textarea
                            rows={2}
                            value={currentNote}
                            onChange={(e) => handleNotesChange(app._id, e.target.value)}
                            placeholder="Recruiter contact, interview round, deadline..."
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-moss resize-none"
                          />
                        </div>

                        {/* Save feedback & Save button */}
                        <div className="flex items-center justify-between pt-1">
                          {savedFeedbacks[app._id] ? (
                            <span className="text-[10px] font-bold text-moss">Saved ✓</span>
                          ) : (
                            <span />
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSaveCard(app)}
                            loading={updateMutation.isPending}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
