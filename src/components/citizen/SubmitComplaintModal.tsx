import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint, IssueType } from '../../types';
import {
  X,
  Camera,
  Mic,
  MapPin,
  Sparkles,
  Upload,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Volume2,
  RefreshCw,
  LocateFixed,
} from 'lucide-react';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
  initialCategory?: string;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
}) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [address, setAddress] = useState('402 West Elm Street, Ward 14');
  const [latitude, setLatitude] = useState(42.3670);
  const [longitude, setLongitude] = useState(-71.0520);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  // Sample preset images for quick testing
  const sampleImages = [
    { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80', desc: 'Water pipe burst bubbling through sidewalk pavement on 402 West Elm Street' },
    { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80', desc: 'Deep pothole in the middle lane causing dangerous tire impact' },
    { label: 'Garbage', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80', desc: 'Overflowing municipal refuse dumpster spilling into pedestrian alleyway' },
    { label: 'Streetlight', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80', desc: 'Streetlight fixture completely blacked out for the past two nights' },
  ];

  useEffect(() => {
    if (initialCategory && initialCategory !== 'camera' && initialCategory !== 'voice' && initialCategory !== 'text') {
      setDescription(`Issue regarding ${initialCategory}: `);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleImage = (sample: typeof sampleImages[0]) => {
    setImagePreview(sample.url);
    setSelectedFile(null);
    if (!description || description.length < 10) {
      setDescription(sample.desc);
    }
  };

  // Voice recording simulation or Web Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      clearInterval(timerRef.current);
      setAudioUrl('mock_audio_recording.mp3');
      if (!description) {
        setDescription('Water pipe is leaking heavily near the curb and filling up the roadway.');
      }
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setAddress(`Current Location (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}), Ward 14`);
          setIsLocating(false);
        },
        () => {
          // fallback
          setLatitude(42.3601);
          setLongitude(-71.0589);
          setAddress('Sion Road, Block 400, Ward 14');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !imagePreview) {
      setError('Please provide a description or photo of the issue.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        text_description: description,
        image_file: selectedFile || imagePreview || undefined,
        audio_file: audioUrl || undefined,
        latitude,
        longitude,
        address,
        user_id: user?.id,
      };

      const result = await api.complaints.submit(payload);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="submit-complaint-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="submit-complaint-modal-card"
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 text-left transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900 leading-tight">
                Report a Civic Issue
              </h3>
              <p className="text-xs text-slate-500">Multimodal AI classification & instant routing</p>
            </div>
          </div>
          <button
            id="close-submit-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4.5">
          {/* Photo Upload & Sample Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Photo Evidence</span>
              <span className="text-[11px] font-normal text-slate-400">Required for fast AI verification</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-950 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                  <span className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} /> Photo Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-rose-600 text-white backdrop-blur-md transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 group-hover:text-[#2563EB] group-hover:border-blue-200 flex items-center justify-center mx-auto mb-2 transition">
                  <Upload size={18} />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Click to upload photo or drag & drop
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, HEIC up to 10MB</div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Quick Demo Photo Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Demo Photos:</span>
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSampleImage(s)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                >
                  +{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Voice Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Describe the Issue</label>
              <button
                type="button"
                onClick={toggleRecording}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Mic size={13} className={isRecording ? 'text-white' : 'text-slate-600'} />
                <span>{isRecording ? `Recording... (${recordingSeconds}s)` : 'Voice Dictate'}</span>
              </button>
            </div>

            <textarea
              id="complaint-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Water is bubbling out of the pavement near the intersection, causing a large pool that blocks crossing..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-slate-900 transition resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Location & GPS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Incident Location</span>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
              >
                <LocateFixed size={12} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Acquiring GPS...' : 'Auto-Detect GPS'}</span>
              </button>
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-slate-900 transition"
                  placeholder="Street address, ward, or landmark"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}</span>
              <span>Ward 14 (Downtown District)</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="submit-complaint-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Analyzing with CivicAI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-blue-200" />
                  <span>Analyze & File Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
