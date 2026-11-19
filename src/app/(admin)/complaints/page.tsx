'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useComplaints } from '@/hooks/useComplaints';
import ComplaintTable from '@/components/dashboard/ComplaintTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
}

function ComplaintsListContent() {
  const searchParams = useSearchParams();
  const initialFlagged = searchParams.get('isFlagged') === 'true';

  const [status, setStatus] = useState<string>('ALL');
  const [departmentId, setDepartmentId] = useState<string>('ALL');
  const [isFlagged, setIsFlagged] = useState<boolean>(initialFlagged);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [departments, setDepartments] = useState<Department[]>([]);

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

  const { data, isLoading } = useComplaints({
    status,
    departmentId,
    isFlagged: isFlagged || undefined,
    search: search.trim() || undefined,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Grievance Redressal Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Filter, inspect AI tamper forensics, re-route nodal departments, and update grievance statuses.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Grievance
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, keyword, address..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Flagged Checkbox */}
          <div className="flex items-center pt-5">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFlagged}
                onChange={(e) => {
                  setIsFlagged(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
              />
              <span className="text-xs font-bold text-red-700">
                ⚠️ Show Only AI-Flagged Cases
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ComplaintTable
        complaints={data?.complaints || []}
        isLoading={isLoading}
        isAdmin={true}
      />

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{data.page}</span> of{' '}
            <span className="font-bold text-slate-800">{data.totalPages}</span> ({data.total} total
            records)
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
            >
              &larr; Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComplaintsListPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="table" count={5} />}>
      <ComplaintsListContent />
    </Suspense>
  );
}
