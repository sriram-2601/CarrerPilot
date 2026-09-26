import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  FileText,
  BookOpen,
  Code2
} from 'lucide-react';
import {
  useInternships,
  useMatches,
  useSkillGaps,
  useResumeVersions,
  useGenerateResumeVariant,
  useApproveResumeVersion,
  useCreateOrProgressApplication
} from '../api/queries.js';
import { api } from '../api/client.js';
import { Button } from '../components/Button.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorBanner } from '../components/ErrorBanner.jsx';

export function InternshipDetailPage() {
  const { id } = useParams();

  const { data: internships = [], isLoading: internshipsLoading } = useInternships();
  const { data: matches = [] } = useMatches();
  const { data: skillGapReport, isLoading: gapsLoading } = useSkillGaps(id);
  const { data: resumeVersions = [] } = useResumeVersions();

  const generateVariantMutation = useGenerateResumeVariant();
  const approveMutation = useApproveResumeVersion();
  const applyMutation = useCreateOrProgressApplication();

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [applySuccessNotice, setApplySuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const internship = internships.find((job) => String(job._id) === String(id));
  const match = matches.find((m) => String(m.internshipId) === String(id));
  const currentVersion = resumeVersions.find((v) => String(v.internshipId) === String(id));

  if (internshipsLoading) {
    return <LoadingState message="Loading internship details..." />;
  }

  if (!internship) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-semibold text-ink-700">Internship opportunity not found.</p>
        <Link to="/internships">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Explorer
          </Button>
        </Link>
      </div>
    );
  }

  const handleGenerate = async () => {
    setErrorNotice('');
    try {
      await generateVariantMutation.mutateAsync(internship._id);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to generate tailored resume.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentVersion) return;
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/application-materials/${currentVersion._id}/pdf`, {
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      setErrorNotice('Failed to stream generated PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleApplyWithUpdated = async () => {
    try {
      await applyMutation.mutateAsync({
        internshipId: internship._id,
        status: 'APPLIED',
        notes: `Applied with tailored resume variant (approved: ${Boolean(currentVersion?.approved)})`
      });
      setApplySuccessNotice(`Application status marked as APPLIED! Opening portal...`);
      setTimeout(() => setApplySuccessNotice(''), 4000);
      window.open(internship.applyLink, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(internship.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/internships"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-moss transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Internship Explorer
        </Link>
      </div>

      <ErrorBanner message={errorNotice} onDismiss={() => setErrorNotice('')} />

      {applySuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{applySuccessNotice}</span>
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-moss uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {internship.company}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-ink-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-ink-400" />
                {internship.location}
              </span>
              {internship.source && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-ink-600">
                  {internship.source}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              {internship.title}
            </h1>

            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed pt-2">
              {internship.description}
            </p>
          </div>

          {/* Match Score Badge */}
          <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center min-w-[140px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
              Match Score
            </span>
            {match ? (
              <div>
                <span
                  className={`text-3xl font-extrabold ${
                    match.score >= 75
                      ? 'text-moss'
                      : match.score >= 50
                      ? 'text-gold-dark'
                      : 'text-ink-600'
                  }`}
                >
                  {match.score}%
                </span>
                <p className="text-[10px] text-ink-500 mt-1">Evaluated by Matching Agent</p>
              </div>
            ) : (
              <span className="text-xs text-ink-400 italic">Not scored yet</span>
            )}
          </div>
        </div>

        {/* Skills Required Overview */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
            Required Technical Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(internship.skillsRequired || []).map((skill) => (
              <span
                key={skill}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-ink-800 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Match Rationale & Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Match Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-moss" />
            AI Match Rationale
          </h2>

          {match ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-ink-800 leading-relaxed italic">
                "{match.reason}"
              </div>

              <div>
                <span className="font-bold text-emerald-800 block mb-1.5 flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Verified Skills Matched ({match.matchedSkills?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {(match.matchedSkills || []).map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {s}
                    </span>
                  ))}
                  {(!match.matchedSkills || match.matchedSkills.length === 0) && (
                    <span className="text-ink-400 italic">None yet</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold text-coral-dark block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-coral" />
                  Skill Gaps Identified ({match.missingSkills?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {(match.missingSkills || []).map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      {s}
                    </span>
                  ))}
                  {(!match.missingSkills || match.missingSkills.length === 0) && (
                    <span className="text-emerald-700 font-semibold">Zero gaps! Full skill overlap.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-400 py-6 text-center">
              Click "Calculate Matches" on the Dashboard or Explorer to score this internship.
            </p>
          )}
        </div>

        {/* Skill-Gap Agent Study Plan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-4">
          <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-dark" />
            Skill-Gap Preparation Plan
          </h2>

          {skillGapReport?.studyPlan && skillGapReport.studyPlan.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {skillGapReport.studyPlan.map((plan, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-900 text-sm">{plan.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plan.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : plan.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-ink-700'
                      }`}
                    >
                      {plan.priority} PRIORITY
                    </span>
                  </div>

                  <p className="text-ink-700">
                    <span className="font-semibold text-ink-900">Study Action:</span> {plan.suggestedAction}
                  </p>

                  <p className="text-ink-600 bg-white p-2 rounded-lg border border-slate-200 flex items-start gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-moss shrink-0 mt-0.5" />
                    <span><b className="text-ink-800">Mini-Project:</b> {plan.miniProject}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-500 py-6 text-center leading-relaxed">
              {match ? 'Great alignment! No critical skill gaps found for this role.' : 'Match score required to build study plan.'}
            </p>
          )}
        </div>
      </div>

      {/* Preparation Agent: Resume Tailoring & Zero-Dependency PDF Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-moss" />
              Preparation Agent — Tailored Resume & PDF Export
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Re-tailors the Skills section of your real resume (matching keywords first, zero fabrication).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              loading={generateVariantMutation.isPending}
              icon={Sparkles}
              variant={currentVersion ? 'secondary' : 'primary'}
              size="sm"
            >
              {currentVersion ? 'Regenerate Tailored Resume' : 'Generate Tailored Resume'}
            </Button>
          </div>
        </div>

        {currentVersion ? (
          <div className="space-y-6">
            {/* Version Status and Change Summary */}
            <div className="p-4 rounded-2xl bg-moss/5 border border-moss/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-moss uppercase tracking-wider">
                  Honest Change Summary
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    currentVersion.approved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {currentVersion.approved ? '✓ Candidate Approved' : 'Pending Review'}
                </span>
              </div>

              <ul className="text-xs text-ink-700 space-y-1 list-disc list-inside">
                {(currentVersion.changeSummary || []).map((change, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resume Content View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Tailored Resume Content Preview
                </span>
                <span className="text-[11px] text-ink-400">
                  Ready for Zero-Dependency PDF Streaming
                </span>
              </div>
              <pre className="p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-80 whitespace-pre-wrap">
                {currentVersion.content}
              </pre>
            </div>

            {/* Actions: View PDF, Approve, Apply with Updated */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleDownloadPdf}
                  loading={downloadingPdf}
                  variant="secondary"
                  icon={Download}
                  size="md"
                >
                  View / Download PDF
                </Button>

                {!currentVersion.approved && (
                  <Button
                    onClick={() => approveMutation.mutate(currentVersion._id)}
                    loading={approveMutation.isPending}
                    variant="outline"
                    icon={Check}
                    size="md"
                  >
                    Approve Version
                  </Button>
                )}
              </div>

              <Button
                onClick={handleApplyWithUpdated}
                variant="primary"
                icon={ExternalLink}
                size="md"
                className="w-full sm:w-auto"
              >
                Apply with Updated Resume
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-500 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-ink-800">No tailored resume generated for this role yet.</p>
            <p className="max-w-md mx-auto">
              Click "Generate Tailored Resume" to re-order your verified skills to emphasize the keywords required for this position.
            </p>
            <Button
              onClick={handleGenerate}
              loading={generateVariantMutation.isPending}
              icon={Sparkles}
              size="sm"
            >
              Generate Tailored Resume
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
