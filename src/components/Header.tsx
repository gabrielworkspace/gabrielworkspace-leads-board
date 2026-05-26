import { Calendar, Rocket } from 'lucide-react';
import { currentDate, currentDay } from '../mockData';

export function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
          Dashboard Insight
        </h1>
        <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
          Acompanhamento de Vendas & Automação
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="glass-panel px-4 py-2 flex items-center gap-2 rounded-full border border-primary-500/20">
          <Rocket className="w-4 h-4 text-primary-500" />
          <span className="font-semibold text-sm">Projeto Dia: <span className="text-primary-400">{currentDay}</span></span>
        </div>
        <div className="glass-panel px-4 py-2 flex items-center gap-2 rounded-full">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{currentDate}</span>
        </div>
      </div>
    </header>
  );
}
