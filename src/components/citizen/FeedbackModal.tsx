import React, { useState } from 'react';
import { api } from '../../services/api';
import { Feedback } from '../../types';
import { X, Star, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface FeedbackModalProps {
  complaintId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (feedback: Feedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [resolutionConfirmed, setResolutionConfirmed] = useState<'completely' | 'partially' | 'no'>('completely');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.complaints.submitFeedback(complaintId, {
        rating,
        comment,
        resolution_confirmed: resolutionConfirmed,
      });
      onSuccess(res.feedback);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="feedback-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        id="feedback-modal-card"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-extrabold font-heading text-stone-900">
              Rate Resolution Quality
            </h3>
            <p className="text-xs text-stone-500">Case ID: {complaintId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Star rating selector */}
          <div className="space-y-1.5 text-center py-2 bg-stone-50 rounded-xl border border-stone-200/70">
            <label className="text-xs font-bold text-stone-700 block">Overall Satisfaction</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition focus:outline-none"
                >
                  <Star
                    size={26}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    stroke="#f59e0b"
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#12533e] block">
              {rating === 5 ? 'Excellent Work' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
            </span>
          </div>

          {/* Radio status options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 block">Is the issue fully resolved on-site?</label>
            <div className="space-y-1.5">
              {[
                { id: 'completely', label: 'Yes, completely resolved' },
                { id: 'partially', label: 'Partially resolved (some remains)' },
                { id: 'no', label: 'No, issue is still present' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                    resolutionConfirmed === opt.id
                      ? 'bg-[#e5f8ee] border-[#12533e]/30 text-[#12533e] font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution_confirmed"
                    value={opt.id}
                    checked={resolutionConfirmed === opt.id}
                    onChange={() => setResolutionConfirmed(opt.id as any)}
                    className="text-[#12533e] focus:ring-[#12533e]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 block">Citizen Comments / Feedback</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide comments for the municipal team..."
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12533e]/30 focus:border-[#12533e] text-stone-900 transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#12533e] hover:bg-[#0e4231] text-white text-xs font-bold transition shadow-md shadow-[#12533e]/15 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>Submit Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
