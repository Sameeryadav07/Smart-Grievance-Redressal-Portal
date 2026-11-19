'use client';

import React from 'react';
import Link from 'next/link';
import { ComplaintWithRelations } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate, truncateText } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface ComplaintTableProps {
  complaints: ComplaintWithRelations[];
  isLoading?: boolean;
  isAdmin?: boolean;
}

export default function ComplaintTable({
  complaints,
  isLoading = false,
  isAdmin = false,
}: ComplaintTableProps) {
  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
          📑
        </div>
        <h4 className="text-base font-bold text-gray-900">No Complaints Found</h4>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          No records match your selected filters or criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Tracking ID</th>
              <th className="py-3.5 px-4">Grievance Title</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">AI Verification</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {complaints.map((c) => {
              const detailHref = isAdmin ? `/complaints/${c.id}` : `/track/${c.trackingId}`;
              const isFlagged = c.aiAnalysis?.isFlagged;
              const tamperingScore = c.aiAnalysis?.tamperingScore ?? 0;

              return (
                <tr
                  key={c.id}
                  className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    <Link href={detailHref} className="hover:underline">
                      {c.trackingId}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900 max-w-xs md:max-w-md truncate">
                      {c.title}
                    </div>
                    {c.category && (
                      <span className="text-xs text-gray-500 block">
                        Category: {c.category.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-700 whitespace-nowrap">
                    {c.department ? (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {c.department.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Auto-routing...</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.aiAnalysis ? (
                      <div className="flex items-center space-x-2">
                        {isFlagged ? (
                          <span
                            className="inline-flex items-center text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"
                            title={`Flagged! Tampering Score: ${tamperingScore}%`}
                          >
                            ⚠️ FLAGGED ({tamperingScore}%)
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"
                            title={`Authentic. Score: ${tamperingScore}%`}
                          >
                            ✓ Verified ({tamperingScore}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Analyzing...</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={detailHref}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors inline-block"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
