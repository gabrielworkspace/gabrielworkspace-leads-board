import { ChevronLeft, ChevronRight, Calendar, Sparkles, MessageSquare, Bell } from 'lucide-react';
import profilePic from '../../img/WhatsApp Image 2026-05-22 at 14.11.20(1).jpeg';

interface Props {
  dateFilter: string;
  setDateFilter: (val: string) => void;
}

export function TopBar({ dateFilter, setDateFilter }: Props) {
  return (
    <header className="flex flex-col gap-8 mb-8 mt-2">
      <div className="flex justify-between items-center w-full">
         <div className="flex items-center gap-2 text-sm text-gray-400 font-medium tracking-wide">
           <span className="hover:text-white cursor-pointer transition-colors">Principal</span>
           <span>/</span>
           <span className="text-white">Visão Geral</span>
         </div>
         
         <div className="flex items-center gap-4">
           {/* Date Filter disguised as a range picker */}
           <div className="flex items-center bg-[#121212] border border-white/5 rounded-xl h-10">
             <button className="px-3 hover:bg-white/5 rounded-l-xl h-full flex items-center text-gray-400"><ChevronLeft size={16}/></button>
             <div className="flex items-center gap-2 px-3 border-x border-white/5 h-full">
                <Calendar size={14} className="text-gray-400"/>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer appearance-none">
                  <option value="30" className="bg-[#121212]">Últimos 30 Dias</option>
                  <option value="7" className="bg-[#121212]">Últimos 7 Dias</option>
                  <option value="all" className="bg-[#121212]">Todo o Período</option>
                </select>
             </div>
             <button className="px-3 hover:bg-white/5 rounded-r-xl h-full flex items-center text-gray-400"><ChevronRight size={16}/></button>
           </div>
           
           <button className="btn-primary text-xs px-4 h-10 flex items-center gap-2">
             <Sparkles size={14} /> Testar Previsão por IA
           </button>
           
           <div className="flex items-center gap-2 ml-4">
             <button className="w-10 h-10 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><MessageSquare size={16}/></button>
             <button className="w-10 h-10 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
               <Bell size={16}/>
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00A3FF] rounded-full shadow-[0_0_8px_#00A3FF]"></span>
             </button>
             <img src={profilePic} className="w-10 h-10 rounded-xl object-cover ml-2 border border-white/10" alt="Profile"/>
           </div>
         </div>
      </div>
      
      <div>
         <h2 className="text-3xl font-normal text-white mb-2 tracking-wide">Bem-vindo de volta, <span className="font-bold">Gabriel!</span></h2>
         <p className="text-gray-400 text-sm">Seu dia está calibrado. A IA ajustou suas próximas ações.</p>
      </div>
    </header>
  );
}
