import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint, ComplaintStatus } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Droplets,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';

interface MyComplaintsListProps {
  onSelectComplaint: (id: string) => void;
  onOpenReport: () => void;
}

export const MyComplaintsList: React.FC<MyComplaintsListProps> = ({
  onSelectComplaint,
  onOpenReport,
}) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await api.complaints.list(user?.id);
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user?.id]);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.issue_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusTabs: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All Cases', count: complaints.length },
    { id: 'submitted', label: 'Submitted', count: complaints.filter((c) => c.status === 'submitted').length },
    { id: 'in_progress', label: 'In Progress', count: complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length },
    { id: 'resolved', label: 'Resolved', count: complaints.filter((c) => c.status === 'resolved').length },
  ];

  return (
    <div id="my-complaints-list-view" className="space-y-5 max-w-4xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-stone-900">Your Filed Complaints</h2>
          <p className="text-xs text-stone-500">Track real-time municipal response & officer actions</p>
        </div>
        <button
          onClick={onOpenReport}
          className="bg-[#12533e] hover:bg-[#0e4231] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#12533e]/15 flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, address, or issue category..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12533e]/30 focus:border-[#12533e] text-stone-900 transition"
          />
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#12533e] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-emerald-400 text-[#12533e]' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaints List Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <div className="w-8 h-8 border-2 border-[#12533e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Retrieving case records from city registry...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <FileQuestion size={24} />
          </div>
          <h4 className="text-sm font-bold text-stone-900">No complaints found</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Try adjusting your filters.`
              : 'You have not submitted any complaints matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              id={`citizen-complaint-${c.id}`}
              onClick={() => onSelectComplaint(c.id)}
              className="bg-white rounded-xl border border-stone-200 hover:border-[#12533e]/50 hover:shadow-md transition p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {c.media && c.media.length > 0 ? (
                  <img
                    src={c.media[0].file_url}
                    alt={c.title}
                    className="w-18 h-18 rounded-xl object-cover flex-shrink-0 ring-1 ring-stone-200"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-xl bg-[#e5f8ee] text-[#12533e] flex items-center justify-center flex-shrink-0">
                    <Droplets size={26} />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-stone-400">{c.id}</span>
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                    {c.needs_followup && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Action Required
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{c.title}</h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin size={12} className="text-stone-400" />
                    <span>{c.location?.address || 'Downtown Zone, Ward 14'}</span>
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-1 italic">
                    "{c.description}"
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock size={12} />
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-bold text-[#12533e] flex items-center gap-1 mt-2">
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
