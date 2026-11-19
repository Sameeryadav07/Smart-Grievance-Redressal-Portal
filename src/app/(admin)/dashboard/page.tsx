'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#0d9488', '#e11d48', '#d97706', '#7c3aed', '#059669', '#ea580c', '#475569'];

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useStats();

  const categoryChartData = useMemo(() => {
    if (!stats?.byCategory) return [];
    return stats.byCategory.map((item) => ({
      name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
      fullName: item.name,
      value: item.count,
    }));
  }, [stats]);

  const departmentChartData = useMemo(() => {
    if (!stats?.byDepartment) return [];
    return stats.byDepartment.map((item) => ({
      name: item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name,
      fullName: item.name,
      count: item.count,
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stats" />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 font-bold">Failed to load administrative analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner if Flagged Complaints exist */}
      {stats.flaggedCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {stats.flaggedCount} Suspicious Submission(s) Flagged by AI Vision Engine
              </h3>
              <p className="text-xs text-red-100">
                Potential image splicing, photoshop manipulation, or high-similarity duplicate complaints detected.
              </p>
            </div>
          </div>
          <Link
            href="/complaints?isFlagged=true"
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap transition-colors"
          >
            Review Flagged Cases &rarr;
          </Link>
        </div>
      )}

      {/* Row 1: KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered"
          value={stats.totalComplaints}
          icon="📋"
          color="blue"
          subtitle="All received submissions"
        />
        <StatsCard
          title="Under Review / Pending"
          value={stats.pendingCount}
          icon="⏳"
          color="yellow"
          subtitle="Awaiting officer dispatch"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressCount}
          icon="⚡"
          color="orange"
          subtitle="Active on-ground resolution"
        />
        <StatsCard
          title="Resolved Successfully"
          value={stats.resolvedCount}
          icon="✓"
          color="green"
          subtitle="Verified by citizens"
        />
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <span className="mr-2">📊</span> Grievance Category Breakdown
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Live Volume</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} Complaints`,
                    item.payload.fullName,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Bar Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <span className="mr-2">🏢</span> Department Workload Distribution
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Active Cases</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} Complaints`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Grievances Table */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Citizen Submissions</h3>
            <p className="text-xs text-slate-500">Real-time audit log of latest incoming grievances</p>
          </div>
          <Link
            href="/complaints"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-2.5 px-3">Tracking ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">AI Score</th>
                <th className="py-2.5 px-3">Filed</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                    <Link href={`/complaints/${c.id}`}>{c.trackingId}</Link>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {c.department?.name || 'Auto-routing'}
                  </td>
                  <td className="py-2.5 px-3">
                    {c.aiAnalysis?.isFlagged ? (
                      <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                        ⚠️ {c.aiAnalysis.tamperingScore}%
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ {c.aiAnalysis?.tamperingScore ?? 0}%
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{formatDate(c.createdAt)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/complaints/${c.id}`}
                      className="font-bold text-blue-600 hover:text-blue-800"
                    >
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
