import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, ShieldCheck, MapPin, Building2 } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNewComplaint?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenNewComplaint, onOpenAuthModal }) => {
  const { user, role, logout } = useAuth();

  return (
    <header id="main-header" className="bg-card border-b border-border sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base text-[#1E293B] tracking-tight">CIVIC FLOW</span>
              <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                System Active
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] hidden sm:block">AI Complaint-Action & Dispatch System</p>
          </div>
        </div>

        {/* Dynamic Center Title or Quick Search */}
        {title && (
          <div className="hidden md:block text-left">
            <h1 className="text-sm font-bold text-[#1E293B] leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {role === 'citizen' && onOpenNewComplaint && (
            <button
              id="header-report-btn"
              onClick={onOpenNewComplaint}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>+ Report Issue</span>
            </button>
          )}

          <div className="relative hidden sm:block">
            <button
              id="notifications-bell-btn"
              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded-lg transition relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full ring-2 ring-white" />
            </button>
          </div>

          <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block" />

          {/* User Profile Pill & Role Badge */}
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/20"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-[#1E293B] leading-tight flex items-center gap-1">
                {user?.name}
                {role !== 'citizen' && <ShieldCheck size={12} className="text-[#2563EB]" />}
              </div>
              <div className="role-badge mt-0.5 inline-block text-[10px] py-0.5 px-2">
                {role} account
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
