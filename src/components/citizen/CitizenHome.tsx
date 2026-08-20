import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Complaint, IssueType } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import {
  Camera,
  Mic,
  FileText,
  MapPin,
  ArrowRight,
  Sparkles,
  Droplets,
  AlertCircle,
  Trash2,
  Lightbulb,
  Construction,
  Car,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface CitizenHomeProps {
  onOpenReport: (prefillCategory?: string) => void;
  onSelectComplaint: (id: string) => void;
  onViewAllComplaints: () => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  onOpenReport,
  onSelectComplaint,
  onViewAllComplaints,
}) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintsData, issuesData] = await Promise.all([
          api.complaints.list(user?.id),
          api.metadata.getIssueTypes(),
        ]);
        setComplaints(complaintsData);
        setIssueTypes(issuesData);
      } catch (err) {
        console.error('Failed to load citizen home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const activeComplaints = complaints.filter((c) => c.status !== 'resolved');
  const recentResolved = complaints.filter((c) => c.status === 'resolved');

  const categoryIcons: Record<string, React.ElementType> = {
    issue_water: Droplets,
    issue_pothole: Construction,
    issue_garbage: Trash2,
    issue_streetlight: Lightbulb,
    issue_drainage: Droplets,
    issue_traffic: Car,
  };

  return (
    <div id="citizen-home-view" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Welcome & Prompt Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 sm:p-8 ambient-shadow-lg">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-fixed text-xs font-semibold border border-white/15">
            <Sparkles size={14} className="text-primary-fixed" />
            <span>AI Automated Issue Routing</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Resident'}
            </h2>
            <p className="text-primary-fixed text-sm mt-1 max-w-xl">
              See a broken streetlight, pothole, or water leak? Snap a photo or speak your complaint. CivicAI classifies and dispatches field teams automatically.
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              id="citizen-hero-photo-btn"
              onClick={() => onOpenReport('camera')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition backdrop-blur-md group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-primary-fixed group-hover:scale-105 transition">
                  <Camera size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Snap Photo</div>
                  <div className="text-[11px] text-primary-fixed">AI image analysis</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-primary-fixed group-hover:translate-x-1 transition" />
            </button>

            <button
              id="citizen-hero-voice-btn"
              onClick={() => onOpenReport('voice')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition backdrop-blur-md group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-primary-fixed group-hover:scale-105 transition">
                  <Mic size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Voice Note</div>
                  <div className="text-[11px] text-primary-fixed">Speak in your language</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-primary-fixed group-hover:translate-x-1 transition" />
            </button>

            <button
              id="citizen-hero-text-btn"
              onClick={() => onOpenReport('text')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white text-[#1E293B] hover:bg-blue-50 transition shadow-lg group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-primary group-hover:scale-105 transition">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-foreground">File Report</div>
                  <div className="text-[11px] text-slate-500">Quick form entry</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Ambient background deco circle */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Category Quick Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-foreground">Common Issue Categories</h3>
          <span className="text-xs text-slate-500">Select to file directly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {issueTypes.slice(0, 6).map((type) => {
            const Icon = categoryIcons[type.id] || AlertCircle;
            return (
              <button
                key={type.id}
                id={`category-btn-${type.id}`}
                onClick={() => onOpenReport(type.name)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition group shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-primary flex items-center justify-center mb-2 transition">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1">{type.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{type.default_priority.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tracked Complaints Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-heading text-foreground">Your Active Reports</h3>
            {activeComplaints.length > 0 && (
              <span className="bg-[#EFF6FF] text-primary text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                {activeComplaints.length} in progress
              </span>
            )}
          </div>
          <button
            id="view-all-complaints-btn"
            onClick={onViewAllComplaints}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading your complaint updates...</p>
          </div>
        ) : activeComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-sm font-bold text-foreground">No active complaints</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All reported civic issues in your district are currently resolved or you haven't filed any yet.
            </p>
            <button
              onClick={() => onOpenReport()}
              className="mt-4 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition"
            >
              Report a New Issue
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeComplaints.map((c) => (
              <div
                key={c.id}
                id={`complaint-card-${c.id}`}
                onClick={() => onSelectComplaint(c.id)}
                className="bg-white rounded-xl border border-slate-200 hover:border-[#2563EB]/50 hover:shadow-md transition p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {c.media && c.media.length > 0 ? (
                    <img
                      src={c.media[0].file_url}
                      alt={c.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <Droplets size={24} />
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-400">{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                      {c.needs_followup && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{c.location?.address || 'Main St, Ward 14'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
                    <span>Live Tracking</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency & Municipal Helpline Card */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700 text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Life-Threatening Civic Emergencies</div>
            <div className="text-[11px] text-slate-500">For live gas leaks or active electrical wires, call 911 or (555) 019-9999 directly.</div>
          </div>
        </div>
        <a
          href="tel:5550199999"
          className="bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-900 transition whitespace-nowrap"
        >
          Call Hotline
        </a>
      </div>
    </div>
  );
};
