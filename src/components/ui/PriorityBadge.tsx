import React from 'react';
import { getPriorityColor } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: string;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorClasses = getPriorityColor(priority);
  const isUrgent = priority === 'URGENT';

  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-md font-medium border border-current/20 ${colorClasses} ${
        isUrgent ? 'animate-pulse font-bold ring-2 ring-red-400' : ''
      }`}
    >
      {isUrgent && <span className="mr-1">⚡</span>}
      {priority}
    </span>
  );
}
