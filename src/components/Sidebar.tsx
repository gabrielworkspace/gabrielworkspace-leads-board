import { LayoutDashboard, Clock, CheckSquare, Layers, Trophy, Calendar, LogOut, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
}

export function Sidebar({ activeView, setActiveView, onLogout, isOpen }: Props) {
  const mainItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Visão Geral' },
    { icon: <Clock size={18} />, label: 'Métricas de Tempo' },
    { icon: <CheckSquare size={18} />, label: 'Tarefas Diárias' },
    { icon: <Layers size={18} />, label: 'Projetos' },
    { icon: <Trophy size={18} />, label: 'Melhores Dias' },
    { icon: <Calendar size={18} />, label: 'Planejamento' },
    { icon: <Users size={18} />, label: 'Comparação Dump' },
  ];

  return (
    <aside className={clsx(
      "w-[240px] flex flex-col h-screen py-6 px-4 fixed lg:sticky top-0 left-0 border-r border-white/5 bg-[#0A0A0A] z-40 transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 flex-shrink-0 bg-white rounded-md flex items-center justify-center transform -skew-x-12">
           <div className="w-4 h-4 bg-black transform skew-x-12 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white"></div>
           </div>
        </div>
        <h1 className="text-xl font-bold tracking-wide text-white">Holo</h1>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 no-scrollbar">
        {/* Main Menu */}
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Principal</h3>
          {mainItems.map((item, i) => {
            const isActive = activeView === item.label;
            return (
              <div 
                key={i} 
                onClick={() => setActiveView(item.label)}
                className={clsx(
                  "nav-item text-sm px-3 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3", 
                  isActive ? "bg-gradient-to-r from-[#00A3FF] to-[#0055FF] text-white shadow-[0_0_15px_rgba(0,163,255,0.3)] font-semibold" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 text-sm px-3 py-2.5 text-gray-400 hover:text-[#EF4444] hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}
