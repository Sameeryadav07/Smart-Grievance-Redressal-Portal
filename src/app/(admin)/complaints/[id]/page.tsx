'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useComplaint, useUpdateComplaint } from '@/hooks/useComplaints';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { formatDate } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
}

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, refetch } = useComplaint(id);
  const complaint = data?.complaint;
  const updateMutation = useUpdateComplaint();

  // Action Form States
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  const [newDeptId, setNewDeptId] = useState<string>('');
  const [officerComment, setOfficerComment] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await axios.get('/api/departments');
        if (res.data?.departments) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status);
      setNewPriority(complaint.priority);
      setNewDeptId(complaint.departmentId?.toString() || '');
    }
  }, [complaint]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerComment.trim() || officerComment.trim().length < 5) {
      toast.error('Please enter an official comment of at least 5 characters');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: complaint!.id,
        status: newStatus,
        priority: newPriority,
        departmentId: newDeptId ? parseInt(newDeptId, 10) : undefined,
        comment: officerComment.trim(),
      });
      toast.success('Complaint status and audit remarks updated!');
      setOfficerComment('');
      refetch();
    } catch (err: any) {
      toast.error('Failed to update complaint record.');
    }
  };

  const handleRerunAI = async () => {
    if (!complaint) return;
    setIsReanalyzing(true);
    try {
      await axios.post(`/api/complaints/${complaint.id}/analysis`);
      toast.success('AI Forensic pipeline re-executed successfully!');
      refetch();
    } catch (err) {
      toast.error('Failed to re-run AI analysis');
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!complaint) {
    return (
      <div className="card text-center py-12">
        <h3 className="font-bold text-slate-800">Complaint not found</h3>
        <Link href="/complaints" className="text-blue-600 text-xs mt-2 inline-block">
          &larr; Return to Registry
        </Link>
      </div>
    );
  }

  const ai = complaint.aiAnalysis;
  const tamperingScore = ai?.tamperingScore ?? 0;
  const isFlagged = ai?.isFlagged;

  let metadataFlags: string[] = [];
  let duplicates: any[] = [];
  try {
    if (ai?.metadataFlags) metadataFlags = JSON.parse(ai.metadataFlags);
    if (ai?.analysisData) {
      const parsed = JSON.parse(ai.analysisData);
      duplicates = parsed.duplicates || [];
    }
  } catch (e) {}

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-700 uppercase">
            <span>OFFICIAL RECORD</span>
            <span>•</span>
            <span className="bg-blue-50 px-2 py-0.5 rounded">{complaint.trackingId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{complaint.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Submitted by <strong className="text-slate-800">{complaint.user.name}</strong> (
            {complaint.user.email}) on {formatDate(complaint.createdAt)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={complaint.status} size="lg" />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="mr-2">📝</span> Grievance Full Statement
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {complaint.description}
            </p>

            {/* Location Details */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800">📍 Geo-Tag & Address:</span>
              <p className="text-slate-700">{complaint.locationAddress || 'Not specified'}</p>
              {complaint.locationLat && complaint.locationLng && (
                <p className="font-mono text-[11px] text-slate-500">
                  Lat: {complaint.locationLat}, Lng: {complaint.locationLng}
                </p>
              )}
            </div>
          </div>

          {/* Photo & ELA Heatmap Comparison */}
          {complaint.imagePath && (
            <div className="card space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="mr-2">🔬</span> Forensic Visual Evidence Comparison
                </h2>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isFlagged ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isFlagged ? '⚠️ SPLICING / TAMPERING SUSPECTED' : '✓ AUTHENTIC PASS'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 uppercase">Original Upload:</p>
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={complaint.imagePath}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-700 uppercase">
                    Error Level Analysis (ELA) Heatmap:
                  </p>
                  <div className="aspect-video rounded-xl overflow-hidden border border-indigo-200 bg-slate-950 flex items-center justify-center">
                    {ai?.elaImagePath ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ai.elaImagePath}
                        alt="ELA Heatmap"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-xs text-slate-400">Heatmap processing or unavailable</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Officer Action History */}
          <div className="card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="mr-2">📋</span> Departmental Audit & Remarks History
            </h2>

            {complaint.updates && complaint.updates.length > 0 ? (
              <div className="space-y-3">
                {complaint.updates.map((update, idx) => (
                  <div
                    key={update.id || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900">
                        {update.officer?.name || 'Officer'}
                      </span>
                      <span className="text-slate-400 font-normal">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Marked as {update.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-slate-700 pt-1">{update.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No departmental updates yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis & Action Controls */}
        <div className="space-y-6">
          {/* AI Inspection Card */}
          <div className="card space-y-4 border-t-4 border-t-indigo-600">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <span className="mr-1.5">🤖</span> AI Forensic Diagnostics
              </h3>
              <button
                type="button"
                onClick={handleRerunAI}
                disabled={isReanalyzing}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {isReanalyzing ? 'Scanning...' : '↻ Re-run AI'}
              </button>
            </div>

            {ai ? (
              <div className="space-y-3 text-xs">
                {/* Tampering Meter */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">Tampering Risk Score</span>
                    <span
                      className={
                        tamperingScore > 60
                          ? 'text-red-600 font-black'
                          : tamperingScore > 30
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }
                    >
                      {tamperingScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        tamperingScore > 60
                          ? 'bg-red-600'
                          : tamperingScore > 30
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, tamperingScore))}%` }}
                    />
                  </div>
                </div>

                {/* Inferred Category */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    NLP Auto-Category
                  </span>
                  <p className="font-bold text-slate-900">
                    {ai.autoCategory || 'General Civic'} (
                    {Math.round((ai.categoryConfidence || 0.85) * 100)}% match)
                  </p>
                </div>

                {/* Duplicates Found */}
                {duplicates.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">
                      ⚠️ Potential Duplicates Detected ({duplicates.length})
                    </span>
                    {duplicates.map((dup, i) => (
                      <Link
                        key={i}
                        href={`/complaints/${dup.complaintId}`}
                        className="block text-[11px] font-medium text-amber-900 hover:underline truncate"
                      >
                        • [{dup.trackingId}] {dup.title} ({Math.round(dup.similarityScore * 100)}% similarity)
                      </Link>
                    ))}
                  </div>
                )}

                {/* Metadata Flags */}
                {metadataFlags.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Metadata Flags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {metadataFlags.map((flag, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No AI telemetry available.</p>
            )}
          </div>

          {/* Action Update Form */}
          <div className="card space-y-4 border-t-4 border-t-blue-700">
            <h3 className="text-sm font-bold text-slate-900 flex items-center border-b border-slate-100 pb-2">
              <span className="mr-2">⚖️</span> Redressal Action Console
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Escalation</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Officer Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={officerComment}
                  onChange={(e) => setOfficerComment(e.target.value)}
                  placeholder="Record on-ground verification notes, assigned junior engineer name, or resolution rationale..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Recording Update...' : 'Commit Status & Log Remark'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
