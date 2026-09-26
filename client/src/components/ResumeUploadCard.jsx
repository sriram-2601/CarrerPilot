import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Info, Sparkles, RefreshCw } from 'lucide-react';
import { useUploadResume } from '../api/queries.js';
import { Button } from './Button.jsx';

export function ResumeUploadCard({ profile, onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const fileInputRef = useRef(null);

  const uploadMutation = useUploadResume();

  const handleFile = (file) => {
    setErrorMessage('');
    setSuccessNotice('');

    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Please upload a PDF file (application/pdf).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload a smaller PDF resume.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setErrorMessage('');
    setSuccessNotice('');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await uploadMutation.mutateAsync(formData);
      setSuccessNotice(res.message || 'Resume uploaded and pipeline updated.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploaded) onUploaded(res.profile);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload or parse resume. Ensure file contains text.');
    }
  };

  const skills = profile?.skills || [];
  const hasResume = Boolean(profile?.resumeText && profile.resumeText.length >= 30);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-moss" />
            Resume Upload & Parsing Engine
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Single source of truth: Profile Agent extracts verified skills & candidate facts
          </p>
        </div>
        {hasResume && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resume Active
          </span>
        )}
      </div>

      {/* Critical Reset Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Pipeline Reset Rule:</span> Uploading a new resume replaces your profile, archives prior runs to your <span className="font-semibold underline">Resume History</span> log, and clears stale matches & tailored versions so all downstream stages stay synchronized with your newest resume.
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-moss bg-moss/5 scale-[0.99]'
            : 'border-slate-300 hover:border-moss/70 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-moss/10 flex items-center justify-center mx-auto mb-3 text-moss">
          <UploadCloud className="w-6 h-6" />
        </div>

        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-sm font-bold text-ink-900">{selectedFile.name}</p>
            <p className="text-xs text-ink-500">{(selectedFile.size / 1024).toFixed(1)} KB — Ready to parse</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink-800">
              Drag and drop your PDF resume here, or <span className="text-moss underline">browse</span>
            </p>
            <p className="text-xs text-ink-400">PDF format only, maximum size 5MB</p>
          </div>
        )}
      </div>

      {/* Action / Error / Success */}
      {selectedFile && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setSelectedFile(null)}
            className="text-xs text-ink-500 hover:text-ink-700 font-medium"
          >
            Clear selection
          </button>
          <Button
            onClick={handleUploadSubmit}
            loading={uploadMutation.isPending}
            icon={Sparkles}
            size="md"
          >
            Parse & Reset Pipeline
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-coral-subtle border border-coral/30 text-coral-dark text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-coral" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Extracted Skills Preview Chips */}
      {skills.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Extracted Skills ({skills.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-ink-800 border border-slate-200/80"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
