'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useComplaints } from '@/hooks/useComplaints';
import ComplaintTable from '@/components/dashboard/ComplaintTable';

export default function MyComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useComplaints({
    my: true,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Registered Grievances
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review status history, officer comments, and AI verification for complaints filed from your account.
          </p>
        </div>
        <Link href="/submit" className="btn-primary text-sm whitespace-nowrap">
          + File New Grievance
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Complaints Table */}
      <ComplaintTable complaints={data?.complaints || []} isLoading={isLoading} />
    </div>
  );
}
