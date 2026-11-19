'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useComplaint } from '@/hooks/useComplaints';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { formatDate } from '@/lib/utils';

const STATUS_STEPS = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'];

export default function TrackDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, error } = useComplaint(id);
  const complaint = data?.complaint;

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto card text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-900">Grievance Record Not Found</h2>
        <p className="text-sm text-slate-600">
          We could not locate any complaint matching tracking reference <code>{id}</code>. Please
          verify the ID or return to tracking search.
        </p>
        <Link href="/track" className="btn-primary text-sm inline-block">
          Try Another Reference
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(complaint.status);
  const isRejected = complaint.status === 'REJECTED';
  const ai = complaint.aiAnalysis;
  const tamperingScore = ai?.tamperingScore ?? 0;
  const isFlagged = ai?.isFlagged;

  let metadataFlags: string[] = [];
  try {
    if (ai?.metadataFlags) {
      metadataFlags = JSON.parse(ai.metadataFlags);
    }
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="card bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200 uppercase tracking-widest">
              <span>Grievance Dossier</span>
              <span>•</span>
              <span className="font-mono">{complaint.trackingId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{complaint.title}</h1>
            <p className="text-xs text-blue-200 mt-1">
              Registered on {formatDate(complaint.createdAt)} by {complaint.user.name}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <StatusBadge status={complaint.status} size="lg" />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        {/* Status Stepper */}
        {!isRejected ? (
          <div className="mt-8 pt-6 border-t border-blue-700/60">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-4">
              Lifecycle Progress:
            </p>
            <div className="grid grid-cols-4 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step} className="text-center relative">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                        isCompleted
                          ? 'bg-emerald-400 text-blue-950 ring-4 ring-emerald-400/20 shadow-md'
                          : 'bg-blue-950/80 text-blue-300 border border-blue-600'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-white font-bold'
                          : isCompleted
                          ? 'text-emerald-300'
                          : 'text-blue-300/70'
                      }`}
                    >
                      {step.replace(/_/g, ' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            ⚠️ This grievance has been officially <strong>REJECTED</strong> by the nodal authority.
            Review officer notes below for the stated rationale.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="mr-2">📄</span> Grievance Description & Location
            </h2>

            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {complaint.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Assigned Department</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {complaint.department?.name || 'Automated Routing In-Progress'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {complaint.category?.name || 'General Grievance'}
                </span>
              </div>
            </div>

            {/* Geolocation info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <span>📍</span>
                <span>Location Landmark / Address:</span>
              </div>
              <p className="text-slate-700 pl-5">
                {complaint.locationAddress || 'No street address specified.'}
              </p>
              {complaint.locationLat && complaint.locationLng && (
                <p className="text-[11px] font-mono text-slate-500 pl-5">
                  Coordinates: {complaint.locationLat.toFixed(5)}°N,{' '}
                  {complaint.locationLng.toFixed(5)}°E
                </p>
              )}
            </div>
          </div>

          {/* Photographic Evidence & ELA Heatmap */}
          {complaint.imagePath && (
            <div className="card space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="mr-2">🖼️</span> Uploaded Evidence & AI Analysis
                </span>
                {ai && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isFlagged ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isFlagged ? '⚠️ Flagged for Review' : '✓ Verified Authentic'}
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Photo */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Submitted Citizen Photo:
                  </p>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={complaint.imagePath}
                      alt="Complaint Photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* ELA Heatmap (if available) */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Error Level Analysis (ELA) Heatmap:
                  </p>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-indigo-200 bg-slate-900 shadow-inner flex items-center justify-center">
                    {ai?.elaImagePath ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ai.elaImagePath}
                        alt="ELA Heatmap"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-2xl">🔬</span>
                        <p className="text-[11px] text-slate-300 mt-1">
                          ELA Heatmap processing or unavailable
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    High contrast glow indicates potential image tampering or splicing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Department Updates Timeline */}
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="mr-2">💬</span> Official Action Log & Remarks
            </h2>

            {complaint.updates && complaint.updates.length > 0 ? (
              <div className="space-y-4">
                {complaint.updates.map((update, idx) => (
                  <div
                    key={update.id || idx}
                    className="flex space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      👮
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">
                          {update.officer?.name || 'Nodal Grievance Officer'}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Status &rarr; {update.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-slate-700 mt-1">{update.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No officer remarks recorded yet. Investigation is in queue.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) - AI Diagnostics & Actions */}
        <div className="space-y-6">
          {/* AI Diagnostics Dossier */}
          <div className="card space-y-4 border-t-4 border-t-indigo-600">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <span className="mr-2">🤖</span> AI Verification Summary
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                v2.4
              </span>
            </div>

            {ai ? (
              <div className="space-y-4 text-xs">
                {/* Tampering Meter */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">Tampering Risk Score</span>
                    <span
                      className={`font-black ${
                        tamperingScore > 60
                          ? 'text-red-600'
                          : tamperingScore > 30
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {tamperingScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        tamperingScore > 60
                          ? 'bg-red-600'
                          : tamperingScore > 30
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, tamperingScore))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {tamperingScore < 30
                      ? 'No digital manipulation detected.'
                      : tamperingScore < 60
                      ? 'Minor compression anomalies detected.'
                      : 'Significant tampering / spliced pixels flagged!'}
                  </p>
                </div>

                {/* Auto Categorization Confidence */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">AI Inferred Category</span>
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{ai.autoCategory || 'Civic Infrastructure'}</span>
                    <span className="text-blue-700">
                      {Math.round((ai.categoryConfidence || 0.85) * 100)}% Conf.
                    </span>
                  </div>
                </div>

                {/* Flags */}
                {metadataFlags.length > 0 && (
                  <div>
                    <span className="text-slate-500 block mb-1">Inspected Metadata Flags:</span>
                    <div className="flex flex-wrap gap-1">
                      {metadataFlags.map((flag, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Analysis data pending or queued.</p>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="card bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">Need Immediate Help?</h4>
            <p className="text-slate-600">
              For emergency situations (gas leakage, fallen live electric wires, major structural
              collapse), call the 24x7 State Emergency Helpline:
            </p>
            <p className="text-base font-black text-red-600">☎️ 112 / 1070</p>
          </div>
        </div>
      </div>
    </div>
  );
}
