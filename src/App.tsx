import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ProgressChart } from './components/ProgressChart';
import { QuickStats } from './components/QuickStats';
import { DailySummary } from './components/DailySummary';
import { FinancialSummary } from './components/FinancialSummary';
import { LeadsTable } from './components/LeadsTable';
import { DataEntryModal } from './components/DataEntryModal';
import { DailyReportModal } from './components/DailyReportModal';
import { Login } from './components/Login';
import { DailyTasks } from './components/DailyTasks';
import { BestDays } from './components/BestDays';
import { Planner } from './components/Planner';
import { Projects } from './components/Projects';
import { DumpComparison } from './components/DumpComparison';
import { Plus } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import type { Lead } from './types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [activeView, setActiveView] = useState('Visão Geral');
  const [dateFilter, setDateFilter] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'outreach' | 'financial' | 'leads' | 'settings'>('outreach');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('@NexusBoard:userId');
  });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { metrics, leads, updateTodayMetrics, addLead, updateLead, removeLead, clearData, loading } = useDashboardData(currentUserId);

  const handleLogin = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('@NexusBoard:userId', userId);
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('@NexusBoard:userId');
  };

  const openModal = (tab: 'outreach' | 'financial' | 'leads' | 'settings' = 'outreach') => {
    setModalInitialTab(tab);
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setModalInitialTab('leads');
    setIsModalOpen(true);
  };

  const filteredMetrics = useMemo(() => {
    if (dateFilter === 'all') return metrics;
    if (dateFilter === 'yesterday') return metrics.slice(-2, -1);
    const days = parseInt(dateFilter);
    return metrics.slice(-days);
  }, [metrics, dateFilter]);

  const filteredLeads = useMemo(() => {
    if (dateFilter === 'all') return leads;
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().split('T')[0];

    if (dateFilter === '1') {
      return leads.filter(l => l.created_at && l.created_at.startsWith(todayStr));
    }
    
    if (dateFilter === 'yesterday') {
      return leads.filter(l => l.created_at && l.created_at.startsWith(yesterdayStr));
    }

    const days = parseInt(dateFilter);
    const pastD = new Date();
    pastD.setDate(pastD.getDate() - days + 1);
    const pastDateStr = pastD.toISOString().split('T')[0];
    
    return leads.filter(l => {
      if (!l.created_at) return false;
      const leadDateStr = l.created_at.split('T')[0];
      return leadDateStr >= pastDateStr;
    });
  }, [leads, dateFilter]);

  if (!currentUserId) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00A3FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen flex relative overflow-hidden bg-[#050505] justify-center">
      <div className="flex w-full max-w-[1920px] mx-auto bg-transparent">
        <Sidebar activeView={activeView} setActiveView={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }} onLogout={handleLogout} isOpen={isMobileMenuOpen} />

        {/* Overlay for mobile when sidebar is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 h-[100dvh] overflow-y-auto p-4 pt-8 lg:p-10 flex flex-col relative z-10 no-scrollbar w-full">
          <TopBar userId={currentUserId} dateFilter={dateFilter} setDateFilter={setDateFilter} onOpenSidebar={() => setIsMobileMenuOpen(true)} onOpenReport={() => setIsReportModalOpen(true)} activeView={activeView} />
          
          {activeView === 'Visão Geral' ? (
            <div className="flex flex-col gap-6 pb-20 w-full">
              
              {/* TOP GRID: 3 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <ProgressChart metrics={filteredMetrics} />
                <QuickStats metrics={filteredMetrics} onEditMetrics={() => openModal('outreach')} onEditAds={() => openModal('financial')} />
                <DailySummary metrics={filteredMetrics} leads={filteredLeads} />
              </div>
              
              {/* FINANCIAL BREAKDOWN */}
              <div className="w-full">
                <FinancialSummary metrics={filteredMetrics} leads={filteredLeads} />
              </div>
              
              {/* BOTTOM GRID: Table */}
              <div className="w-full overflow-hidden">
                <LeadsTable leads={filteredLeads} onRemoveLead={removeLead} onEditLead={handleEditLead} />
              </div>

            </div>
          ) : activeView === 'Tarefas Diárias' ? (
            <DailyTasks dateFilter={dateFilter} />
          ) : activeView === 'Melhores Dias' ? (
            <BestDays />
          ) : activeView === 'Planejamento' ? (
            <Planner userId={currentUserId} />
          ) : activeView === 'Projetos' ? (
            <Projects userId={currentUserId} />
          ) : activeView === 'Comparação Dump' ? (
            <DumpComparison />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center holo-panel p-10 min-h-[500px]">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0055FF]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,163,255,0.1)]">
                <span className="text-3xl text-[#00A3FF]">🚀</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">{activeView}</h2>
              <p className="text-gray-400 text-center max-w-md leading-relaxed mb-8">
                A página de <span className="text-[#00A3FF] font-semibold">{activeView}</span> está em desenvolvimento.
              </p>
              <button onClick={() => setActiveView('Visão Geral')} className="btn-primary">
                Voltar para Visão Geral
              </button>
            </div>
          )}
        </main>
      </div>

      <button 
        onClick={() => openModal('outreach')}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#00A3FF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,163,255,0.4)] hover:bg-[#008AE6] hover:scale-110 active:scale-95 transition-all z-50 text-white"
        title="Add Data"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <DataEntryModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }} 
        currentMetrics={metrics[metrics.length - 1]}
        onSaveMetrics={updateTodayMetrics}
        onAddLead={addLead}
        onUpdateLead={updateLead}
        editingLead={editingLead}
        onClearData={clearData}
        initialTab={modalInitialTab}
      />

      <DailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={metrics[metrics.length - 1]}
        leads={leads}
      />
    </div>
  );
}

export default App;
