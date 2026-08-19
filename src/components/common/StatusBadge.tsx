import React from 'react';
import { ComplaintStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: Clock,
          dotColor: 'bg-slate-500',
        };
      case 'assigned':
        return {
          label: 'Assigned',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: AlertCircle,
          dotColor: 'bg-blue-600',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: PlayCircle,
          dotColor: 'bg-amber-500',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          dotColor: 'bg-emerald-600',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: Clock,
          dotColor: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-tight',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};
