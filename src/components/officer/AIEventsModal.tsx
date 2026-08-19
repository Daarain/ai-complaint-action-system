import React from 'react';
import { AIEvent } from '../../types';
import { X, Sparkles, Code2, CheckCircle2, Cpu, Database, Clock } from 'lucide-react';

interface AIEventsModalProps {
  complaintId: string;
  events: AIEvent[];
  isOpen: boolean;
  onClose: () => void;
}

export const AIEventsModal: React.FC<AIEventsModalProps> = ({
  complaintId,
  events,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div id="ai-events-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="ai-events-modal-card"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 text-left transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles size={20} className="text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                CivicAI Audit & Reasoning Trail
              </h3>
              <p className="text-xs text-slate-500">Case ID: {complaintId} • Real-time orchestration telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Events List */}
        <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Sparkles size={24} className="text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No automated AI reasoning events recorded for this ticket.</p>
            </div>
          ) : (
            events.map((ev) => {
              let parsedOutput = {};
              try {
                parsedOutput = JSON.parse(ev.output_json);
              } catch {
                parsedOutput = { raw: ev.output_json };
              }

              return (
                <div
                  key={ev.id}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu size={14} className="text-[#2563EB]" />
                        {ev.model}
                      </span>
                      <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                        {ev.task}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {Math.round(ev.confidence * 100)}% Confidence
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(ev.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Input Reference / Grounding
                    </span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/70 font-mono text-[11px]">
                      {ev.input_ref}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Code2 size={12} /> Model JSON Output
                    </span>
                    <pre className="text-[11px] bg-slate-950 text-blue-300 p-3 rounded-lg overflow-x-auto font-mono border border-slate-800">
                      {JSON.stringify(parsedOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
