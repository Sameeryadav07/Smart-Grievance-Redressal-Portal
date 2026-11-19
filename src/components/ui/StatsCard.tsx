import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'yellow' | 'orange' | 'green' | 'red' | 'purple';
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
}: StatsCardProps) {
  const colorMap = {
    blue: {
      border: 'border-l-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    yellow: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    orange: {
      border: 'border-l-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
    },
    green: {
      border: 'border-l-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    red: {
      border: 'border-l-red-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
    },
    purple: {
      border: 'border-l-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
  }[color];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${colorMap.border} p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorMap.bg} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
