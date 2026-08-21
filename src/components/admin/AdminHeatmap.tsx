import React, { useState, useEffect } from 'react';
import { HeatmapPoint, IssueType, Department } from '../../types';
import { api } from '../../services/api';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import {
  MapPin,
  Layers,
  Filter,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Radio,
  Search,
  Maximize2,
  Minimize2,
  Navigation,
} from 'lucide-react';

interface AdminHeatmapProps {
  onSelectComplaint: (id: string) => void;
}

export const AdminHeatmap: React.FC<AdminHeatmapProps> = ({ onSelectComplaint }) => {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7d');
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const [heatmapData, issuesData] = await Promise.all([
          api.admin.getHeatmap({ issue_type: selectedIssueType || undefined }),
          api.metadata.getIssueTypes(),
        ]);
        setPoints(heatmapData);
        setIssueTypes(issuesData);
      } catch (err) {
        console.error('Failed to load heatmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, [selectedIssueType, selectedDateRange]);

  // Spatial coordinates normalization for the canvas map representation
  const minLat = 42.3500;
  const maxLat = 42.3700;
  const minLng = -71.0750;
  const maxLng = -71.0500;

  const normalizeCoord = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const wardSummaries = [
    { name: 'Ward 14 (Downtown)', incidents: 12, critical: 4, compliance: '92%' },
    { name: 'Ward 11 (Midtown)', incidents: 6, critical: 1, compliance: '96%' },
    { name: 'Ward 9 (East Quarter)', incidents: 4, critical: 0, compliance: '98%' },
    { name: 'Ward 7 (Waterfront)', incidents: 3, critical: 1, compliance: '94%' },
  ];

  return (
    <div id="admin-heatmap-view" className="space-y-5 text-left pb-20">
      {/* Title & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Spatial Intelligence
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">GPS Clustering & Density</span>
            </div>
            <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
              Geospatial Incident Heatmap
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Issue filter */}
            <select
              value={selectedIssueType}
              onChange={(e) => setSelectedIssueType(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Issue Categories</option>
              {issueTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Date range filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              {['today', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedDateRange(range)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    selectedDateRange === range
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Map Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          {/* Top Map HUD Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-blue-400 font-mono text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>LIVE GIS FEED • METRO DOWNTOWN GRID</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300 text-xs font-medium flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical / High
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Low
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Map Grid & Points */}
          <div className="gis-surface relative w-full h-[360px] my-4 rounded-xl border [background-size:24px_24px]">
            {/* Grid Vector Roads Simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none stroke-blue-500/40">
              <line x1="0%" y1="30%" x2="100%" y2="30%" strokeWidth="2" />
              <line x1="0%" y1="70%" x2="100%" y2="70%" strokeWidth="2" />
              <line x1="25%" y1="0%" x2="25%" y2="100%" strokeWidth="2" />
              <line x1="65%" y1="0%" x2="65%" y2="100%" strokeWidth="3" />
              <circle cx="65%" cy="30%" r="40" fill="none" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Ward Zones Overlay Labels */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-blue-300/40 pointer-events-none">
              [SECTOR A: WARD 14 DOWNTOWN]
            </div>
            <div className="absolute bottom-4 right-6 text-[10px] font-mono text-blue-300/40 pointer-events-none">
              [SECTOR B: WARD 7 WATERFRONT]
            </div>

            {/* Heat Cluster Blobs (Ambient Glows) */}
            <div className="absolute top-[25%] left-[55%] w-32 h-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none animate-pulse" />
            <div className="absolute top-[60%] left-[30%] w-28 h-28 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />

            {/* Rendered Complaint Pins */}
            {points.map((p) => {
              const pos = normalizeCoord(p.latitude, p.longitude);
              const isSelected = selectedPoint?.id === p.id;
              const isCritical = p.priority === 'critical' || p.priority === 'high';

              return (
                <div
                  key={p.id}
                  id={`map-pin-${p.id}`}
                  onClick={() => setSelectedPoint(p)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-4 ring-white scale-125 z-30'
                        : 'hover:scale-110'
                    } ${
                      isCritical
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                        : p.priority === 'medium'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    <MapPin size={12} />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-950 text-white text-[11px] p-2 rounded-lg border border-slate-700 shadow-xl z-30 pointer-events-none">
                    <div className="font-bold line-clamp-1">{p.title}</div>
                    <div className="text-blue-400 text-[10px] mt-0.5">{p.ward} • {p.priority.toUpperCase()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom map status bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono z-10 pt-2 border-t border-slate-800">
            <span>Points Visualized: {points.length} Incidents</span>
            <span>Center Lat: 42.3601, Lng: -71.0589</span>
          </div>
        </div>

        {/* Right Info Drawer / Selected Point Dossier (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPoint ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-bold text-slate-400">PIN INSPECTION</span>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-blue-200">
                    {selectedPoint.issue_type}
                  </span>
                  <PriorityBadge priority={selectedPoint.priority} size="sm" />
                </div>
                <h3 className="text-sm font-extrabold font-heading text-slate-900">
                  {selectedPoint.title}
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                <div><strong>Ward:</strong> {selectedPoint.ward}</div>
                <div><strong>Coordinates:</strong> {selectedPoint.latitude.toFixed(4)}, {selectedPoint.longitude.toFixed(4)}</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <strong>Status:</strong>
                  <StatusBadge status={selectedPoint.status} size="sm" />
                </div>
              </div>

              <button
                id="heatmap-view-case-btn"
                onClick={() => onSelectComplaint(selectedPoint.id)}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Open Full Case File</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layers size={16} className="text-[#2563EB]" />
                <h3 className="text-sm font-extrabold font-heading text-slate-900">
                  Ward Hotspot Summary
                </h3>
              </div>

              <div className="space-y-2.5">
                {wardSummaries.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F8FAFC] hover:bg-[#EFF6FF]/60 border border-slate-200 rounded-xl transition space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{w.name}</span>
                      <span className="text-blue-700">{w.compliance} SLA</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{w.incidents} Total Incidents</span>
                      {w.critical > 0 && (
                        <span className="text-rose-600 font-semibold">{w.critical} Critical</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Click any coordinate pin on the map to inspect specific ticket records and dispatch status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
