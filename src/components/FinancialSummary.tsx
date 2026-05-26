import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import type { DailyMetrics, Lead } from '../types';

interface Props {
  metrics: DailyMetrics[];
  leads: Lead[];
}

export function FinancialSummary({ metrics, leads }: Props) {
  const latest = metrics[metrics.length - 1] || { lpRevenue: 0, adSpend: 0 };
  
  const paidRevenue = latest.lpRevenue || 0;
  const adSpend = latest.adSpend || 0;
  
  const organicRevenue = leads
    .filter(l => l.status === 'Closed' && l.value)
    .reduce((sum, lead) => sum + (lead.value || 0), 0);

  const totalRevenue = organicRevenue + paidRevenue;
  const totalProfit = totalRevenue - adSpend;
  const paidProfit = paidRevenue - adSpend;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Faturamento Total */}
      <div className="holo-panel p-6 flex flex-col relative group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#A3FF12]/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#A3FF12]" />
          </div>
          <h3 className="text-sm font-medium text-gray-300">Faturamento Total</h3>
        </div>
        <div className="mt-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Entrada Geral (Orgânico + Tráfego)</span>
          <h2 className="text-3xl font-light text-white tracking-wider">R$ {totalRevenue.toLocaleString('pt-BR')}</h2>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Orgânico:</span>
             <span className="text-gray-300 font-medium">+ R$ {organicRevenue.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Tráfego:</span>
             <span className="text-gray-300 font-medium">+ R$ {paidRevenue.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* 2. Lucro Real Descontado */}
      <div className="holo-panel p-6 flex flex-col relative group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#8BE600]/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#8BE600]" />
          </div>
          <h3 className="text-sm font-medium text-gray-300">Lucro Real Descontado</h3>
        </div>
        <div className="mt-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Dinheiro no Bolso (Líquido)</span>
          <h2 className="text-3xl font-bold text-white tracking-wider">R$ {totalProfit.toLocaleString('pt-BR')}</h2>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Faturamento:</span>
             <span className="text-gray-300 font-medium">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Custos de Tráfego:</span>
             <span className="text-[#EF4444] font-medium">- R$ {adSpend.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* 3. Retorno do Tráfego Pago */}
      <div className="holo-panel p-6 flex flex-col relative group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#C6F432]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#C6F432]" />
          </div>
          <h3 className="text-sm font-medium text-gray-300">Raio-X do Tráfego Pago</h3>
        </div>
        <div className="mt-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Lucro Exclusivo dos Anúncios</span>
          <h2 className={`text-3xl font-light tracking-wider ${paidProfit >= 0 ? 'text-white' : 'text-[#EF4444]'}`}>
             R$ {paidProfit.toLocaleString('pt-BR')}
          </h2>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Gasto em Ads:</span>
             <span className="text-[#EF4444] font-medium">- R$ {adSpend.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-xs">
             <span className="text-gray-500">Retorno (Faturamento):</span>
             <span className="text-[#A3FF12] font-medium">+ R$ {paidRevenue.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
