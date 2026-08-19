import React, { useState, useEffect } from 'react';
import { DepartmentPerformance } from '../../types';
import { api } from '../../services/api';
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Search,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getDepartmentsPerformance();
        setDepartments(data);
      } catch (err) {
        console.error('Failed to load department performance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const filteredDepts = departments
    .filter((d) => d.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'desc'
        ? b.sla_compliance_pct - a.sla_compliance_pct
        : a.sla_compliance_pct - b.sla_compliance_pct;
    });

  return (
    <div id="admin-departments-view" className="space-y-6 text-left pb-20">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Department Operations
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">SLA Enforcement Matrix</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            Department Performance & Resolution Benchmarks
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-800"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ArrowUpDown size={13} />
            <span>SLA: {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}</span>
          </button>
        </div>
      </div>

      {/* Main Department Matrix Cards */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Querying municipal bureau performance ledgers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((d) => {
            const isHighCompliance = d.sla_compliance_pct >= 94;
            return (
              <div
                key={d.department_id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#2563EB]/40 p-5 shadow-sm space-y-4 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold border border-blue-200">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {d.department_name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {d.department_id}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      isHighCompliance
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.sla_compliance_pct}% SLA
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>SLA Compliance Goal (90%)</span>
                    <span className="font-bold text-slate-800">{d.sla_compliance_pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHighCompliance ? 'bg-[#2563EB]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${d.sla_compliance_pct}%` }}
                    />
                  </div>
                </div>

                {/* Metric Quadrants */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/70 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Open Cases</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">{d.open_cases}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Resolved</div>
                    <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{d.total_resolved}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Avg Time</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">{d.avg_resolution_time}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-slate-400" />
                    <strong>{d.active_officers}</strong> Officers on Duty
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck size={13} /> Operational
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
