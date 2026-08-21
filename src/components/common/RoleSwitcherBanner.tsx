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
    <div id="role-switcher-banner" className="bg-primary text-primary-foreground border-b border-primary px-4 py-2 text-xs">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
          <span className="font-semibold tracking-wide flex items-center gap-1.5 text-white">
            <Sparkles size={14} className="text-white" />
            Civic Flow Live Environment
          </span>
          <span className="text-white hidden sm:inline">•</span>
          <span className="text-white hidden sm:inline">
            Active: <strong className="text-white font-medium">{user?.name}</strong> ({role.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-white mr-1 text-[11px] font-medium hidden md:inline">Switch Perspective:</span>
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
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'bg-primary text-white hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={13} className="text-white" />
                <span>{r.title.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${isActive ? 'bg-white/15 text-white' : 'bg-white/10 text-white'}`}>
                  {r.badge}
                </span>
              </button>
            );
          })}

          {onOpenAuthModal && (
            <button
              id="open-auth-modal-btn"
              onClick={onOpenAuthModal}
              className="ml-2 text-white hover:text-white underline text-[11px] font-medium transition"
            >
              Sign In / Custom User
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
