import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint, Department } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Inbox,
  Filter,
  ArrowUpDown,
  Search,
  Clock,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface OfficerQueueProps {
  onSelectComplaint: (id: string) => void;
}

export const OfficerQueue: React.FC<OfficerQueueProps> = ({ onSelectComplaint }) => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [sortByPriority, setSortByPriority] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [queueData, deptsData] = await Promise.all([
        api.officer.getQueue({
          department_id: selectedDept || undefined,
          sort: sortByPriority ? 'priority' : undefined,
        }),
        api.metadata.getDepartments(),
      ]);
      setQueue(queueData);
      setDepartments(deptsData);
    } catch (err) {
      console.error('Failed to load officer queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedDept, sortByPriority]);

  const filteredQueue = queue.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.issue_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const criticalCount = queue.filter((c) => c.priority === 'critical').length;
  const inProgressCount = queue.filter((c) => c.status === 'in_progress').length;

  return (
    <div id="officer-queue-view" className="space-y-5 text-left pb-16">
      {/* Top Banner / Officer Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Department Operations
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Active Duty: Zone 3 Response</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            Assigned Case Queue
          </h2>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-center">
            <div className="text-xs font-bold text-rose-800 flex items-center gap-1">
              <Flame size={13} className="text-rose-600" />
              <span>{criticalCount} Critical</span>
            </div>
            <div className="text-[10px] text-rose-600">Immediate Action</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <Clock size={13} className="text-amber-600" />
              <span>{inProgressCount} Active</span>
            </div>
            <div className="text-[10px] text-amber-600">Crews On-Site</div>
          </div>
        </div>
      </div>

      {/* Filter and Control Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active tickets by ID, street address, or category..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-slate-900 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Department selector */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Priority sort toggle */}
            <button
              onClick={() => setSortByPriority(!sortByPriority)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                sortByPriority
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>{sortByPriority ? 'Priority: Critical First' : 'Standard Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Queue Cards / Table */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Syncing with Municipal Dispatch Hub...</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">Queue is Clear</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No pending or overdue complaints assigned to this queue filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map((c) => {
            const isCritical = c.priority === 'critical';
            return (
              <div
                key={c.id}
                id={`officer-case-${c.id}`}
                onClick={() => onSelectComplaint(c.id)}
                className={`bg-white rounded-xl border p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-200 hover:border-rose-400 shadow-sm hover:shadow-md'
                    : 'border-slate-200 hover:border-[#2563EB]/50 hover:shadow-md'
                }`}
              >
                {/* Left info & media */}
                <div className="flex items-start gap-4">
                  {c.media && c.media.length > 0 ? (
                    <img
                      src={c.media[0].file_url}
                      alt={c.title}
                      className="w-18 h-18 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Shield size={24} />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">{c.id}</span>
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-blue-200">
                        AI Conf: {Math.round(c.ai_confidence * 100)}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {c.location?.address || 'Zone 3 • Ward 14'}
                      </span>
                      <span>•</span>
                      <span>Reporter: {c.user?.name || 'Citizen'}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{c.description}"
                    </p>
                  </div>
                </div>

                {/* Right Action & SLA countdown */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      <span>SLA: 12h Target</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Logged: {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <button
                    id={`inspect-case-btn-${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint(c.id);
                    }}
                    className="mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Manage Case</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
