import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserCheck, Shield, Award, Sparkles, RefreshCw } from 'lucide-react';

interface RoleSwitcherBannerProps {
  onOpenAuthModal?: () => void;
}

export const RoleSwitcherBanner: React.FC<RoleSwitcherBannerProps> = ({ onOpenAuthModal }) => {
  const { user, role, switchDemoRole, isLoading } = useAuth();

  const roles: { key: UserRole; title: string; label: string; icon: React.ElementType; badge: string }[] = [
    { key: 'citizen', title: 'Citizen Portal', label: 'Mohammed Ali', icon: UserCheck, badge: 'Resident' },
    { key: 'officer', title: 'Field Officer Hub', label: 'Officer M. Davis', icon: Shield, badge: 'Water & Ops' },
    { key: 'admin', title: 'Municipal Admin', label: 'Dir. R. Hayes', icon: Award, badge: 'City Command' },
  ];

  return (
    <div id="role-switcher-banner" className="bg-[#0F172A] text-white border-b border-[#1E293B] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
          <span className="font-semibold tracking-wide flex items-center gap-1.5 text-slate-200">
            <Sparkles size={14} className="text-[#60A5FA]" />
            Civic Flow Live Environment
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Active: <strong className="text-white font-medium">{user?.name}</strong> ({role.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-400 mr-1 text-[11px] font-medium hidden md:inline">Switch Perspective:</span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                id={`switch-role-${r.key}`}
                onClick={() => switchDemoRole(r.key)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'bg-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{r.title.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${isActive ? 'bg-blue-400/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {r.badge}
                </span>
              </button>
            );
          })}

          {onOpenAuthModal && (
            <button
              id="open-auth-modal-btn"
              onClick={onOpenAuthModal}
              className="ml-2 text-[#60A5FA] hover:text-blue-300 underline text-[11px] font-medium transition"
            >
              Sign In / Custom User
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
