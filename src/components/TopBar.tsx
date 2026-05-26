import { ChevronLeft, ChevronRight, Calendar, Bell, Menu } from 'lucide-react';
import profilePic from '../../img/WhatsApp Image 2026-05-22 at 14.11.20(1).jpeg';
import matheusPic from '../../img/WhatsApp Image 2026-05-22 at 14.31.57.jpeg';

interface Props {
  dateFilter: string;
  setDateFilter: (val: string) => void;
  onOpenSidebar?: () => void;
  onOpenReport: () => void;
  activeView?: string;
  userId?: string | null;
}

export function TopBar({ dateFilter, setDateFilter, onOpenSidebar, onOpenReport, activeView, userId }: Props) {
  const displayName = userId === 'matheus' ? 'Matheus' : 'Gabriel';
  const currentPic = userId === 'matheus' ? matheusPic : profilePic;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isAfter10PM = now.getHours() >= 22;
  const hasSeenReport = localStorage.getItem('@NexusBoard:lastReportSeen') === todayStr;
  
  const showNotification = isAfter10PM && !hasSeenReport;

  const handleOpenReport = () => {
    if (showNotification) {
      localStorage.setItem('@NexusBoard:lastReportSeen', todayStr);
    }
    onOpenReport();
  };

  const isDailyTasks = activeView === 'Tarefas Diárias';
  const filterOptions = isDailyTasks ? ['1', 'yesterday'] : ['1', 'yesterday', '7', '30', 'all'];
  const currentFilterIndex = filterOptions.indexOf(dateFilter);

  const handlePrevFilter = () => {
    if (currentFilterIndex > 0) {
      setDateFilter(filterOptions[currentFilterIndex - 1]);
    }
  };

  const handleNextFilter = () => {
    if (currentFilterIndex < filterOptions.length - 1) {
      setDateFilter(filterOptions[currentFilterIndex + 1]);
    }
  };

  return (
    <header className="flex flex-col gap-6 lg:gap-8 mb-6 lg:mb-8 mt-2">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center w-full gap-4">
         <div className="flex items-center justify-between w-full lg:w-auto">
           <div className="flex items-center gap-2 text-sm text-gray-400 font-medium tracking-wide">
             <button onClick={onOpenSidebar} className="lg:hidden p-2 -ml-2 text-white hover:bg-white/5 rounded-lg">
               <Menu size={20} />
             </button>
             <span className="hidden lg:inline hover:text-white cursor-pointer transition-colors">Principal</span>
             <span className="hidden lg:inline">/</span>
             <span className="text-white">{activeView || 'Visão Geral'}</span>
           </div>
           
           <div className="flex items-center gap-2 lg:hidden">
              <button onClick={handleOpenReport} className="w-9 h-9 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-gray-400 relative transition-colors hover:text-white">
                <Bell size={14}/>
                {showNotification && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#00A3FF] rounded-full shadow-[0_0_8px_#00A3FF]"></span>}
              </button>
              <img src={currentPic} className="w-9 h-9 rounded-xl object-cover ml-1 border border-white/10" alt="Profile"/>
           </div>
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
           {/* Date Filter disguised as a range picker */}
           <div className="flex-1 lg:flex-none flex items-center bg-[#121212] border border-white/5 rounded-xl h-10">
             <button 
               onClick={handleNextFilter}
               disabled={currentFilterIndex >= filterOptions.length - 1}
               className={`px-3 hover:bg-white/5 rounded-l-xl h-full flex items-center ${currentFilterIndex >= filterOptions.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400'}`}>
               <ChevronLeft size={16}/>
             </button>
             <div className="flex items-center justify-center gap-2 px-3 border-x border-white/5 h-full flex-1">
                <Calendar size={14} className="text-gray-400"/>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer appearance-none text-center">
                  <option value="1" className="bg-[#121212]">Hoje</option>
                  <option value="yesterday" className="bg-[#121212]">Ontem</option>
                  {!isDailyTasks && (
                    <>
                      <option value="7" className="bg-[#121212]">Últimos 7 Dias</option>
                      <option value="30" className="bg-[#121212]">Últimos 30 Dias</option>
                      <option value="all" className="bg-[#121212]">Todo o Período</option>
                    </>
                  )}
                </select>
             </div>
             <button 
               onClick={handlePrevFilter}
               disabled={currentFilterIndex <= 0}
               className={`px-3 hover:bg-white/5 rounded-r-xl h-full flex items-center ${currentFilterIndex <= 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400'}`}>
               <ChevronRight size={16}/>
             </button>
           </div>
           
           <div className="hidden lg:flex items-center gap-2 ml-4">
             <button onClick={handleOpenReport} className="w-10 h-10 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
               <Bell size={16}/>
               {showNotification && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00A3FF] rounded-full shadow-[0_0_8px_#00A3FF]"></span>}
             </button>
             <img src={currentPic} className="w-10 h-10 rounded-xl object-cover ml-2 border border-white/10" alt="Profile"/>
           </div>
         </div>
      </div>
      
      <div>
         <h2 className="text-3xl font-normal text-white mb-2 tracking-wide">Bem-vindo de volta, <span className="font-bold">{displayName}!</span></h2>
         <p className="text-gray-400 text-sm">Pronto para bater as metas de hoje?</p>
      </div>
    </header>
  );
}
