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
      className="w-60 bg-primary text-primary-foreground flex-shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-6.5rem)] border-r border-white/20"
    >
      <div className="py-5 space-y-5">
        {/* Brand / Logo Header */}
        <div className="px-5 font-extrabold text-base tracking-tight text-white flex items-center gap-2">
          <Shield size={20} className="text-white" />
          <span>CIVIC FLOW</span>
        </div>

        {/* Context Card */}
        <div className="mx-4 bg-white/10 border border-white/20 rounded-xl p-3 text-left">
          <div className="flex items-center gap-2 text-white font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-wider">{role === 'admin' ? 'Command Center' : 'Field Operations'}</span>
          </div>
          <p className="text-[11px] text-white/80 mt-1 leading-snug">
            {role === 'admin'
              ? 'Real-time telemetry & dispatch'
              : 'Zone 3 Rapid Response Unit'}
          </p>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 px-5 py-1">
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
                    ? 'bg-white/15 text-white border-l-4 border-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-white' : 'text-white/75'} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-primary' : 'bg-white/10 text-white/75'
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
      <div className="p-4 border-t border-white/20 space-y-2 text-left">
        <div className="text-[11px] text-white/80 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>SLA Engine Online • 99.9%</span>
        </div>
        <div className="text-[10px] text-white/65">
          Connected to Municipal API Gateway
        </div>
      </div>
    </aside>
  );
};
