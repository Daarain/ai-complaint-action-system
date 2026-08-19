import React from 'react';
import { ComplaintPriority } from '../../types';
import { Flame, AlertTriangle, Info, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'critical':
        return {
          label: 'Critical',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: Flame,
          dotColor: 'bg-red-600',
        };
      case 'high':
        return {
          label: 'High',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: AlertTriangle,
          dotColor: 'bg-rose-500',
        };
      case 'medium':
        return {
          label: 'Medium',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: Info,
          dotColor: 'bg-amber-500',
        };
      case 'low':
        return {
          label: 'Low',
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          border: 'border-slate-200',
          icon: ArrowDown,
          dotColor: 'bg-slate-400',
        };
      default:
        return {
          label: priority,
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          border: 'border-slate-200',
          icon: Info,
          dotColor: 'bg-slate-400',
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      id={`priority-badge-${priority}`}
      className={`inline-flex items-center gap-1 rounded-md border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon size={12} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
