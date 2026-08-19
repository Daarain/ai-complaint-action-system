import React, { useState, useEffect } from 'react';
import { AdminStats, Complaint, DepartmentPerformance } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  MapPin,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateToHeatmap: () => void;
  onNavigateToDepartments: () => void;
  onSelectComplaint: (id: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateToHeatmap,
  onNavigateToDepartments,
  onSelectComplaint,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsData, complaintsData, deptsData] = await Promise.all([
          api.admin.getStats(),
          api.complaints.list(),
          api.admin.getDepartmentsPerformance(),
        ]);
        setStats(statsData);
        setRecentComplaints(complaintsData);
        setDepartments(deptsData);
      } catch (err) {
        console.error('Failed to load admin overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center max-w-4xl mx-auto">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Aggregating city-wide municipal telemetry and SLA records...</p>
      </div>
    );
  }

  const criticalIssues = recentComplaints.filter((c) => c.priority === 'critical');

  return (
    <div id="admin-overview-view" className="space-y-6 text-left pb-20">
      {/* Top Welcome & City Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              City Command Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Metro Operations Live</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            Executive Civic Intelligence
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-overview-heatmap-btn"
            onClick={onNavigateToHeatmap}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <MapPin size={14} className="text-[#2563EB]" />
            <span>Open Spatial Heatmap</span>
          </button>

          <button
            onClick={onNavigateToDepartments}
            className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Building size={14} />
            <span>Department SLAs</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Cases</span>
          <div className="text-xl font-extrabold font-heading text-slate-900">{stats?.total || 2481}</div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <TrendingUp size={11} /> +14% vs last week
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Intake</span>
          <div className="text-xl font-extrabold font-heading text-blue-700">{stats?.open || 342}</div>
          <div className="text-[10px] text-slate-500">Auto-classified & queued</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
          <div className="text-xl font-extrabold font-heading text-amber-700">{stats?.in_progress || 321}</div>
          <div className="text-[10px] text-slate-500">Crews active on site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
          <div className="text-xl font-extrabold font-heading text-emerald-700">{stats?.resolved || 1818}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">94.2% Success Rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Critical Alerts</span>
          <div className="text-xl font-extrabold font-heading text-rose-700">{stats?.critical || 24}</div>
          <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">
            <Flame size={11} /> Immediate Hazard
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Resolution</span>
          <div className="text-xl font-extrabold font-heading text-[#2563EB]">
            {stats?.avg_resolution_hours || 18.4}h
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">Under 24h SLA Target</div>
        </div>
      </div>

      {/* Main Charts & Escalation Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Weekly Resolution Velocity Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold font-heading text-slate-900">
                Weekly Intake vs. Resolution Velocity
              </h3>
              <p className="text-xs text-slate-500">7-Day municipal resolution performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Resolved
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Submitted
              </span>
            </div>
          </div>

          {/* Clean Custom Bar Chart */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 px-2">
            {(stats?.weekly_trend || [
              { day: 'Mon', submitted: 42, resolved: 38 },
              { day: 'Tue', submitted: 55, resolved: 49 },
              { day: 'Wed', submitted: 48, resolved: 52 },
              { day: 'Thu', submitted: 68, resolved: 60 },
              { day: 'Fri', submitted: 62, resolved: 64 },
              { day: 'Sat', submitted: 35, resolved: 31 },
              { day: 'Sun', submitted: 28, resolved: 29 },
            ]).map((item, idx) => {
              const maxVal = 70;
              const subH = (item.submitted / maxVal) * 100;
              const resH = (item.resolved / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      className="w-1/2 bg-slate-200 group-hover:bg-slate-300 rounded-t-md transition-all relative"
                      style={{ height: `${subH}%` }}
                      title={`Submitted: ${item.submitted}`}
                    />
                    <div
                      className="w-1/2 bg-[#2563EB] group-hover:bg-[#1D4ED8] rounded-t-md transition-all relative"
                      style={{ height: `${resH}%` }}
                      title={`Resolved: ${item.resolved}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall weekly clearance rate: <strong className="text-emerald-700">96.8%</strong></span>
            <span>Total weekly closed: <strong className="text-slate-900">323 tickets</strong></span>
          </div>
        </div>

        {/* Right (5 cols): Critical Escalations & Rapid Response Feed */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-rose-600" />
              <h3 className="text-sm font-extrabold font-heading text-slate-900">
                Critical Priority Escalations
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {criticalIssues.length} Immediate
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {criticalIssues.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No critical incidents pending immediate action.</p>
            ) : (
              criticalIssues.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c.id)}
                  className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-rose-800">{c.id}</span>
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{c.location?.address || 'Ward 14'}</span>
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-rose-500 mt-1 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department SLA Snapshot Row */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold font-heading text-slate-900">
              Department Performance & SLA Adherence
            </h3>
            <p className="text-xs text-slate-500">Live operational compliance across all municipal bureaus</p>
          </div>
          <button
            onClick={onNavigateToDepartments}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <span>View Full Breakdown</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.slice(0, 6).map((dept) => (
            <div
              key={dept.department_id}
              className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{dept.department_name}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dept.sla_compliance_pct >= 90
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dept.sla_compliance_pct}% SLA
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/60">
                <div>
                  <div className="text-slate-400 text-[10px]">Open</div>
                  <div className="font-bold text-slate-800">{dept.open_cases}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Avg Time</div>
                  <div className="font-bold text-slate-800">{dept.avg_resolution_time}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Resolved</div>
                  <div className="font-bold text-emerald-700">{dept.total_resolved}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
