import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, AIEvent } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { AIEventsModal } from './AIEventsModal';
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Upload,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Camera,
  Send,
  RefreshCw,
  FileCode,
  Layers,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface OfficerDetailProps {
  complaintId: string;
  onBack: () => void;
}

export const OfficerDetail: React.FC<OfficerDetailProps> = ({ complaintId, onBack }) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [aiEvents, setAiEvents] = useState<AIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIEventsModal, setShowAIEventsModal] = useState(false);

  // Status update form state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [remarks, setRemarks] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const sampleEvidenceImages = [
    { label: 'Pipe Repaired & Sealed', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80', desc: 'Installed secondary high-pressure valve sleeve. Leak sealed and pressure tested at 65 PSI.' },
    { label: 'Pothole Asphalt Filled', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80', desc: 'Hot-mix asphalt laid, leveled and compacted with roller unit.' },
    { label: 'Waste Cleared & Sanitized', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80', desc: 'Dumpsters emptied, area power-washed and disinfected.' },
  ];

  const fetchCase = async () => {
    try {
      setLoading(true);
      const [cData, aiData] = await Promise.all([
        api.complaints.getById(complaintId),
        api.officer.getAIEvents(complaintId),
      ]);
      setComplaint(cData);
      setAiEvents(aiData);
      setNewStatus(cData.status);
    } catch (err) {
      console.error('Failed to load officer case detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [complaintId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const updated = await api.officer.updateStatus(complaint.id, {
        status: newStatus,
        remarks: remarks || `Field Officer marked status as ${newStatus}`,
        evidence_image: evidenceImage || undefined,
      });

      setComplaint(updated);
      setUpdateSuccess(true);
      setRemarks('');
      setEvidenceImage(null);
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center max-w-3xl mx-auto">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading case dossier & AI audit records...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-12 text-center max-w-md mx-auto bg-white rounded-xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Case file could not be found.</p>
        <button onClick={onBack} className="mt-3 text-xs text-[#2563EB] font-bold underline">
          Back to Queue
        </button>
      </div>
    );
  }

  const updates = complaint.status_updates || [];

  return (
    <div id="officer-detail-view" className="space-y-6 max-w-6xl mx-auto pb-20 text-left">
      {/* Back button & Case Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#2563EB] transition p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 self-start"
        >
          <ArrowLeft size={16} />
          <span>Back to Action Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="inspect-ai-events-btn"
            onClick={() => setShowAIEventsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-xs font-bold transition shadow-sm"
          >
            <Sparkles size={14} className="text-[#2563EB]" />
            <span>Inspect AI Decision Trail ({aiEvents.length})</span>
          </button>

          <StatusBadge status={complaint.status} size="md" />
        </div>
      </div>

      {/* Two Column Command Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Case Overview, Photos, Citizen Info, AI Diagnostics */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Case Dossier Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">TICKET: {complaint.id}</span>
              <PriorityBadge priority={complaint.priority} size="md" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-blue-200">
                {complaint.issue_type?.name || 'Water Leakage'}
              </span>
              <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-2 leading-tight">
                {complaint.title}
              </h2>
            </div>

            {/* Citizen Attached Photo Evidence */}
            {complaint.media && complaint.media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 max-h-80">
                <img
                  src={complaint.media[0].file_url}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Citizen Natural Statement */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Citizen Statement
              </span>
              <div className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed italic">
                "{complaint.description}"
              </div>
            </div>

            {/* Location & GPS Specs */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#2563EB]" />
                  Incident Coordinates
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {complaint.location?.latitude?.toFixed(4)}, {complaint.location?.longitude?.toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-slate-700">
                <strong>Address:</strong> {complaint.location?.address || '402 West Elm Street'}
              </div>
              <div className="text-xs text-slate-500">
                <strong>District:</strong> {complaint.location?.ward || 'Ward 14'} • {complaint.location?.area || 'Sector 4'}
              </div>
            </div>

            {/* CivicAI Structured Inference */}
            <div className="bg-[#EFF6FF] border border-blue-200/70 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={15} />
                  <span>CivicAI Multi-Modal Classification</span>
                </div>
                <span>Confidence: {Math.round(complaint.ai_confidence * 100)}%</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {complaint.ai_result?.summary ||
                  'Computer vision verified high-flow pipe leakage near pedestrian walkway. Routed to Water & Sanitation Zone 3 with 12h SLA.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Officer Action Terminal & Update Status */}
        <div className="lg:col-span-5 space-y-5">
          {/* Status Update Terminal Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold font-heading text-slate-900">
                Field Officer Action Panel
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">PATCH /complaints/{complaint.id}</span>
            </div>

            {updateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Case status updated successfully! Timeline appended.</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Status Radio Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Update Ticket Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'assigned', label: 'Assigned' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'resolved', label: 'Resolved' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewStatus(s.id as ComplaintStatus)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition text-left flex items-center justify-between ${
                        newStatus === s.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{s.label}</span>
                      {newStatus === s.id && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Officer Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Field Remarks / Log</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Dispatched crew on-site. Isolated the inlet valve and replaced rubber gasket. Pressure restored."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-slate-900 transition resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Evidence Photo Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Resolution Evidence Photo</label>

                {evidenceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-900">
                    <img src={evidenceImage} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEvidenceImage(null)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 text-white text-[10px] px-2 py-1 rounded-md transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                    <Camera size={18} className="text-slate-400 mx-auto mb-1" />
                    <div className="text-[11px] text-slate-500 font-medium">Attach On-Site Resolution Photo</div>
                  </div>
                )}

                {/* Demo Evidence presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Demo Photos:</span>
                  {sampleEvidenceImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEvidenceImage(s.url);
                        if (!remarks) setRemarks(s.desc);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                    >
                      +{s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                id="officer-submit-update-btn"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Commit Status Update</span>
              </button>
            </form>
          </div>

          {/* Action Log / Audit Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Internal Audit Timeline
            </h4>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {updates.map((up, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pl-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center z-10 shrink-0 text-[10px] font-bold">
                    ✓
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 capitalize">{up.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(up.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-snug">{up.remarks}</p>
                    <div className="text-[10px] text-slate-400">Agent: {up.updated_by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Decision Audit Trail Modal */}
      {showAIEventsModal && (
        <AIEventsModal
          complaintId={complaint.id}
          events={aiEvents}
          isOpen={showAIEventsModal}
          onClose={() => setShowAIEventsModal(false)}
        />
      )}
    </div>
  );
};
