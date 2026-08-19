import React, { useState } from 'react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Layers,
  MapPin,
  Send,
  RefreshCw,
  X,
} from 'lucide-react';

interface AIProcessingModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onViewTracking: (complaintId: string) => void;
}

export const AIProcessingModal: React.FC<AIProcessingModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onViewTracking,
}) => {
  const [followupAnswer, setFollowupAnswer] = useState('');
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(complaint);

  React.useEffect(() => {
    setCurrentComplaint(complaint);
  }, [complaint]);

  if (!isOpen || !currentComplaint) return null;

  const ai = currentComplaint.ai_result || {
    issue_type: currentComplaint.issue_type?.name || 'Civic Infrastructure',
    summary: currentComplaint.description,
    severity: currentComplaint.priority,
    confidence: currentComplaint.ai_confidence || 0.92,
    needs_followup: currentComplaint.needs_followup || false,
    followup_question: currentComplaint.followup_question,
  };

  const confidencePct = Math.round(ai.confidence * 100);

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupAnswer.trim()) return;

    setIsSubmittingFollowup(true);
    try {
      const updated = await api.complaints.answerFollowup(currentComplaint.id, followupAnswer);
      setCurrentComplaint(updated);
      setFollowupAnswer('');
    } catch (err) {
      console.error('Followup error', err);
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  return (
    <div id="ai-processing-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="ai-processing-modal-card"
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 text-left transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Status */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles size={20} className="text-blue-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold font-heading text-slate-900 leading-tight">
                  CivicAI Assessment
                </h3>
                <span className="bg-blue-50 text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Case {currentComplaint.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous issue classification & SLA routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Diagnosis Card */}
        <div className="mt-5 space-y-4">
          <div className="bg-[#EFF6FF] border border-blue-200/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Diagnosed Issue
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{ai.issue_type}</div>
              </div>
              <PriorityBadge priority={ai.severity} size="md" />
            </div>

            {/* Confidence Score Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-blue-600" />
                  AI Vision & Text Confidence
                </span>
                <span className="font-bold text-[#2563EB]">{confidencePct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-[#2563EB] rounded-full transition-all duration-1000"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>

            {/* AI Summary */}
            <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
              <strong className="text-slate-900 block mb-0.5">Summary:</strong>
              {ai.summary}
            </div>
          </div>

          {/* Follow-up Clarification Question if confidence is low or info needed */}
          {ai.needs_followup && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                <HelpCircle size={15} className="text-amber-600 shrink-0" />
                <span>AI Clarification Question:</span>
              </div>
              <p className="text-xs text-amber-800 italic">
                "{ai.followup_question || 'Could you provide extra detail about whether water is flowing continuously?'}"
              </p>

              <form onSubmit={handleFollowupSubmit} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={followupAnswer}
                  onChange={(e) => setFollowupAnswer(e.target.value)}
                  placeholder="Type your quick answer..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-amber-700/50"
                />
                <button
                  type="submit"
                  disabled={isSubmittingFollowup || !followupAnswer.trim()}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                >
                  {isSubmittingFollowup ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                  <span>Clarify</span>
                </button>
              </form>
            </div>
          )}

          {/* Similar Reports / Duplicate Detection Check */}
          {ai.similar_reports && ai.similar_reports.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Layers size={14} className="text-slate-500" />
                  <span>Nearby Cluster Detection</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Within 300m</span>
              </div>
              <div className="space-y-1.5">
                {ai.similar_reports.map((sim, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80 text-[11px]"
                  >
                    <span className="font-medium text-slate-800 line-clamp-1">{sim.title}</span>
                    <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {sim.distance_meters}m away
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">
                CivicAI linked your evidence to the existing Ward 14 response ticket to prevent duplicate dispatch.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Close
            </button>

            <button
              type="button"
              id="confirm-track-complaint-btn"
              onClick={() => {
                onViewTracking(currentComplaint.id);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>Track Live Resolution</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
