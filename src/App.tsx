import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CitizenHome } from './components/citizen/CitizenHome';
import { MyComplaintsList } from './components/citizen/MyComplaintsList';
import { ComplaintDetail } from './components/citizen/ComplaintDetail';
import { SubmitComplaintModal } from './components/citizen/SubmitComplaintModal';
import { AIProcessingModal } from './components/citizen/AIProcessingModal';
import { OfficerQueue } from './components/officer/OfficerQueue';
import { OfficerDetail } from './components/officer/OfficerDetail';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminHeatmap } from './components/admin/AdminHeatmap';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AuthModal } from './components/auth/AuthModal';
import { Complaint } from './types';
import {
  Home,
  PlusCircle,
  ClipboardList,
  UserCheck,
  Shield,
  Award,
  Layers,
  MapPin,
  Building,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, user } = useAuth();

  // Navigation State
  const [citizenTab, setCitizenTab] = useState<'home' | 'complaints'>('home');
  const [officerTab, setOfficerTab] = useState<string>('queue');
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [aiProcessedComplaint, setAiProcessedComplaint] = useState<Complaint | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [submitCategoryPrefill, setSubmitCategoryPrefill] = useState<string | undefined>(undefined);

  const handleOpenReport = (category?: string) => {
    setSubmitCategoryPrefill(category);
    setIsSubmitModalOpen(true);
  };

  const handleComplaintSubmitted = (complaint: Complaint) => {
    setAiProcessedComplaint(complaint);
    setIsAIModalOpen(true);
  };

  const handleTrackComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCitizenTab('complaints');
  };

  return (
    <div id="civic-app-container" className="min-h-screen bg-background flex flex-col font-sans">
      {/* 1. Global Role Switcher Simulation Ribbon */}
      <RoleSwitcherBanner onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* 2. Main Navigation Header */}
      <Header
        title={
          role === 'admin'
            ? 'Municipal Command Terminal'
            : role === 'officer'
            ? 'Field Response & Queue'
            : 'Resident Issue Reporter'
        }
        onOpenNewComplaint={() => handleOpenReport()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Sidebar for Desktop Officer / Admin */}
        {role !== 'citizen' && (
          <Sidebar
            currentTab={role === 'admin' ? adminTab : officerTab}
            onSelectTab={(tab) => {
              setSelectedComplaintId(null);
              if (role === 'admin') setAdminTab(tab);
              if (role === 'officer') setOfficerTab(tab);
            }}
          />
        )}

        {/* Dynamic Center Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* ======================================================== */}
          {/* CITIZEN VIEWS */}
          {/* ======================================================== */}
          {role === 'citizen' && (
            <>
              {selectedComplaintId ? (
                <ComplaintDetail
                  complaintId={selectedComplaintId}
                  onBack={() => setSelectedComplaintId(null)}
                />
              ) : citizenTab === 'home' ? (
                <CitizenHome
                  onOpenReport={handleOpenReport}
                  onSelectComplaint={(id) => setSelectedComplaintId(id)}
                  onViewAllComplaints={() => setCitizenTab('complaints')}
                />
              ) : (
                <MyComplaintsList
                  onSelectComplaint={(id) => setSelectedComplaintId(id)}
                  onOpenReport={() => handleOpenReport()}
                />
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* OFFICER VIEWS */}
          {/* ======================================================== */}
          {role === 'officer' && (
            <>
              {selectedComplaintId ? (
                <OfficerDetail
                  complaintId={selectedComplaintId}
                  onBack={() => setSelectedComplaintId(null)}
                />
              ) : officerTab === 'queue' ? (
                <OfficerQueue onSelectComplaint={(id) => setSelectedComplaintId(id)} />
              ) : (
                <OfficerQueue onSelectComplaint={(id) => setSelectedComplaintId(id)} />
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* ADMIN VIEWS */}
          {/* ======================================================== */}
          {role === 'admin' && (
            <>
              {selectedComplaintId ? (
                <OfficerDetail
                  complaintId={selectedComplaintId}
                  onBack={() => setSelectedComplaintId(null)}
                />
              ) : adminTab === 'overview' ? (
                <AdminOverview
                  onNavigateToHeatmap={() => setAdminTab('heatmap')}
                  onNavigateToDepartments={() => setAdminTab('departments')}
                  onSelectComplaint={(id) => setSelectedComplaintId(id)}
                />
              ) : adminTab === 'heatmap' ? (
                <AdminHeatmap onSelectComplaint={(id) => setSelectedComplaintId(id)} />
              ) : (
                <AdminDepartments />
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation (for citizen view) */}
      {role === 'citizen' && (
        <nav
          id="mobile-bottom-nav"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border py-2 px-6 flex items-center justify-around z-40 ambient-shadow-lg"
        >
          <button
            onClick={() => {
              setSelectedComplaintId(null);
              setCitizenTab('home');
            }}
            className={`flex flex-col items-center gap-1 transition ${
              citizenTab === 'home' && !selectedComplaintId ? 'text-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Center quick report FAB */}
          <button
            onClick={() => handleOpenReport()}
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center ambient-shadow-lg hover:scale-105 transition">
              <PlusCircle size={24} />
            </div>
            <span className="text-[10px] font-bold text-[#12533e] mt-0.5">Report</span>
          </button>

          <button
            onClick={() => {
              setSelectedComplaintId(null);
              setCitizenTab('complaints');
            }}
            className={`flex flex-col items-center gap-1 transition ${
              citizenTab === 'complaints' ? 'text-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            <ClipboardList size={20} />
            <span className="text-[10px]">Track</span>
          </button>
        </nav>
      )}

      {/* 5. Modals */}
      <SubmitComplaintModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleComplaintSubmitted}
        initialCategory={submitCategoryPrefill}
      />

      <AIProcessingModal
        complaint={aiProcessedComplaint}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onViewTracking={handleTrackComplaint}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
