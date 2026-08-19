import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  X,
  UserCheck,
  Shield,
  Award,
  Mail,
  Phone,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login({ identifier, password });
      } else {
        await register({ name, phone, email, role: selectedRole });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    try {
      await switchDemoRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold border border-blue-200">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-900">
                {mode === 'login' ? 'Civic Portal Login' : 'Create Civic Account'}
              </h3>
              <p className="text-xs text-slate-500">Access citizen reporting or municipal ops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="mt-4 p-3 bg-[#EFF6FF] rounded-xl border border-blue-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block">
            1-Click Demo Profiles (Instant Sign In)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition"
            >
              <UserCheck size={14} className="text-[#2563EB]" />
              <span>Mohammed (Citizen)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('officer')}
              className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition"
            >
              <Shield size={14} className="text-[#2563EB]" />
              <span>Officer Davis (Water)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition"
            >
              <Award size={14} className="text-[#2563EB]" />
              <span>Dir. Hayes (Admin)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-900"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Email / Phone</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={mode === 'register' ? email : identifier}
                onChange={(e) => (mode === 'register' ? setEmail(e.target.value) : setIdentifier(e.target.value))}
                placeholder="name@civic.org or phone"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Password / Access Key</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Account Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['citizen', 'officer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                      selectedRole === r
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
            <span>{mode === 'login' ? 'Sign In' : 'Register Account'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-xs text-[#2563EB] font-semibold hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
