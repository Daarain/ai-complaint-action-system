import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Building,
  BarChart3,
  LogOut,
  Sparkles,
  Shield,
  Layers,
  Inbox,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { role, user, logout } = useAuth();

  const officerNav: NavItem[] = [
    { id: 'queue', label: 'Action Queue', icon: Inbox, count: '6' },
    { id: 'active', label: 'My Dispatched Units', icon: ClipboardList },
    { id: 'ai-logs', label: 'CivicAI Logs', icon: Sparkles },
  ];

  const adminNav: NavItem[] = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'heatmap', label: 'Geospatial Heatmap', icon: MapPin },
    { id: 'departments', label: 'Department SLAs', icon: Building },
    { id: 'analytics', label: 'Civic Analytics', icon: BarChart3 },
  ];

  const navItems = role === 'admin' ? adminNav : officerNav;

  return (
    <aside
      id="desktop-sidebar"
      className="w-60 bg-[#0F172A] text-white flex-shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-6.5rem)] border-r border-[#1E293B]"
    >
      <div className="py-5 space-y-5">
        {/* Brand / Logo Header */}
        <div className="px-5 font-extrabold text-base tracking-tight text-[#60A5FA] flex items-center gap-2">
          <Shield size={20} className="text-[#60A5FA]" />
          <span>CIVIC FLOW</span>
        </div>

        {/* Context Card */}
        <div className="mx-4 bg-[#1E293B]/80 border border-slate-700/60 rounded-xl p-3 text-left">
          <div className="flex items-center gap-2 text-[#60A5FA] font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            <span className="uppercase tracking-wider">{role === 'admin' ? 'Command Center' : 'Field Operations'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {role === 'admin'
              ? 'Real-time telemetry & dispatch'
              : 'Zone 3 Rapid Response Unit'}
          </p>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-1">
            System Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1E293B] text-white border-l-4 border-[#2563EB]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-[#60A5FA]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#2563EB] text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 space-y-2 text-left">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>SLA Engine Online • 99.9%</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Connected to Municipal API Gateway
        </div>
      </div>
    </aside>
  );
};
