import React, { useState, useEffect } from 'react';
import { Complaint, StatusUpdate } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { FeedbackModal } from './FeedbackModal';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Building,
  User,
  Star,
  MessageSquare,
  HelpCircle,
  Share2,
  Send,
  RefreshCw,
} from 'lucide-react';

interface ComplaintDetailProps {
  complaintId: string;
  onBack: () => void;
}

export const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaintId, onBack }) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [followupText, setFollowupText] = useState('');
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.complaints.getById(complaintId);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [complaintId]);

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupText.trim() || !complaint) return;
    setIsSubmittingFollowup(true);
    try {
      const updated = await api.complaints.answerFollowup(complaint.id, followupText);
      setComplaint(updated);
      setFollowupText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center max-w-3xl mx-auto">
        <div className="w-8 h-8 border-2 border-[#12533e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500">Retrieving case timeline and live dispatch telemetry...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <AlertCircle size={32} className="text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900">Case Record Unavailable</h3>
        <p className="text-xs text-stone-500">{error || 'Complaint record was not found.'}</p>
        <button
          onClick={onBack}
          className="bg-[#12533e] text-white px-4 py-2 rounded-lg text-xs font-semibold"
        >
          Return to Complaints
        </button>
      </div>
    );
  }

  const updates = complaint.status_updates || [];

  return (
    <div id="complaint-detail-view" className="max-w-4xl mx-auto space-y-6 pb-20 text-left">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-complaints-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#12533e] transition p-1.5 -ml-1.5 rounded-lg hover:bg-stone-100"
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-stone-400">ID: {complaint.id}</span>
          <StatusBadge status={complaint.status} size="md" />
        </div>
      </div>

      {/* Main Grid: Left Details & Photos, Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Card & Media */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-sm">
            {/* Title & Priority */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#12533e] bg-[#e5f8ee] px-2.5 py-0.5 rounded-full">
                  {complaint.issue_type?.name || 'Civic Infrastructure'}
                </span>
                <PriorityBadge priority={complaint.priority} size="md" />
              </div>
              <h1 className="text-xl font-extrabold font-heading text-stone-900 leading-tight">
                {complaint.title}
              </h1>
            </div>

            {/* Attached Photo */}
            {complaint.media && complaint.media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-950 max-h-72">
                <img
                  src={complaint.media[0].file_url}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                Citizen Report
              </span>
              <p className="text-stone-800 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/70">
                {complaint.description}
              </p>
            </div>

            {/* Location & Map Preview */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <MapPin size={12} className="text-[#12533e]" />
                Incident Coordinates & Ward
              </span>
              <div className="bg-[#F7F9F8] p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">{complaint.location?.address || '402 West Elm Street'}</div>
                  <div className="text-[11px] text-stone-500">
                    {complaint.location?.ward || 'Ward 14'} • {complaint.location?.area || 'Downtown Civic Sector'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-stone-400">
                    {complaint.location?.latitude?.toFixed(4) || '42.3670'}, {complaint.location?.longitude?.toFixed(4) || '-71.0520'}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    GPS Verified
                  </span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Card */}
            <div className="bg-[#e5f8ee]/40 border border-[#12533e]/15 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#12533e]">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#2f6b55]" />
                  <span>CivicAI Engine Diagnosis</span>
                </div>
                <span className="bg-white text-[#12533e] px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#12533e]/20">
                  {Math.round(complaint.ai_confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {complaint.ai_result?.summary ||
                  'Automated computer vision and NLP model verified infrastructure issue and dispatched appropriate municipal unit.'}
              </p>
            </div>

            {/* Follow-up question if citizen action is needed */}
            {complaint.needs_followup && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                  <HelpCircle size={14} className="text-amber-600" />
                  <span>Clarification Needed:</span>
                </div>
                <p className="text-xs text-amber-800 italic">
                  "{complaint.followup_question || 'Could you provide additional landmark references?'}"
                </p>
                <form onSubmit={handleFollowupSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={followupText}
                    onChange={(e) => setFollowupText(e.target.value)}
                    placeholder="Type your clarification..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-stone-900"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingFollowup || !followupText.trim()}
                    className="bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    {isSubmittingFollowup ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Submit</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Feedback Form / Resolution Confirmation Card (Only when resolved) */}
          {complaint.status === 'resolved' && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>Issue Resolved by Municipal Team</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium">Citizen Feedback</span>
              </div>

              {complaint.feedback ? (
                <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= complaint.feedback!.rating ? '#f59e0b' : 'none'}
                        stroke="#f59e0b"
                      />
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-2">
                      {complaint.feedback.rating} / 5 Stars
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 italic">
                    "{complaint.feedback.comment || 'Resolved promptly. Great work!'}"
                  </p>
                  <div className="text-[10px] text-stone-400 pt-1">
                    Submitted on {new Date(complaint.feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-emerald-800">
                    The field officer marked this case as completed. Please take a moment to rate the resolution quality.
                  </p>
                  <button
                    id="rate-resolution-btn"
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full bg-[#12533e] hover:bg-[#0e4231] text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#12533e]/15 transition flex items-center justify-center gap-2"
                  >
                    <Star size={14} className="text-amber-300" />
                    <span>Rate Resolution Quality</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Status Updates Timeline & Assignment */}
        <div className="lg:col-span-5 space-y-5">
          {/* Assignment & SLA Countdown Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Building size={14} className="text-stone-500" />
                Assigned Unit
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                SLA Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-stone-500">Department:</span>
                <span className="font-bold text-stone-900 text-right">
                  {complaint.assignment?.team_name || 'Water & Sanitation Team'}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-stone-500">Dispatched Lead:</span>
                <span className="font-semibold text-stone-800">
                  {complaint.assignment?.officer_name || 'Officer Marcus Davis'}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-stone-500">Target SLA:</span>
                <span className="font-semibold text-stone-800">Within 12 Hours</span>
              </div>
            </div>
          </div>

          {/* Vertical Progress Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Action Timeline
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">{updates.length} Updates</span>
            </div>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {updates.map((up, idx) => {
                const isLatest = idx === updates.length - 1;
                return (
                  <div key={up.id || idx} className="relative flex items-start gap-3.5 pl-1 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                        isLatest
                          ? 'bg-[#12533e] text-white ring-4 ring-emerald-100'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {up.status === 'resolved' ? (
                        <CheckCircle2 size={12} />
                      ) : up.status === 'in_progress' ? (
                        <PlayCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 capitalize">{up.status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(up.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-snug">{up.remarks}</p>
                      <div className="text-[10px] text-stone-400 font-medium">By: {up.updated_by}</div>

                      {up.evidence_image_url && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-stone-200 max-h-32">
                          <img
                            src={up.evidence_image_url}
                            alt="Resolution Evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          complaintId={complaint.id}
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={(fb) => {
            setComplaint({ ...complaint, feedback: fb });
            setShowFeedbackModal(false);
          }}
        />
      )}
    </div>
  );
};
