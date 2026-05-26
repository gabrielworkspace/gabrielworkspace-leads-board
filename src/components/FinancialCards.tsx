import { DollarSign, TrendingUp, TrendingDown, Target, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import type { DailyMetrics } from '../types';

interface Props {
  metrics: DailyMetrics;
}

export function FinancialCards({ metrics }: Props) {
  const netProfit = metrics.lpRevenue - metrics.adSpend;
  const isProfitPositive = netProfit >= 0;
  
  const responseRate = metrics.messagesSent > 0 
    ? (metrics.messagesReplied / metrics.messagesSent) * 100 
    : 0;

  const cards = [
    {
      title: 'Vendas Landing Page',
      value: `R$ ${metrics.lpRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-4 h-4 text-[#F5B041]" />,
      percentage: '+15.2%',
      isPositive: true,
      color: 'from-[#F5B041]'
    },
    {
      title: 'Tráfego Pago (Ads)',
      value: `R$ ${metrics.adSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <Target className="w-4 h-4 text-gray-300" />,
      percentage: '-5.0%',
      isPositive: false,
      color: 'from-gray-400'
    },
    {
      title: 'Lucro Líquido',
      value: `R$ ${Math.abs(netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: isProfitPositive ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#EF4444]" />,
      percentage: isProfitPositive ? '+22.5%' : '-10.0%',
      isPositive: isProfitPositive,
      color: isProfitPositive ? 'from-[#10B981]' : 'from-[#EF4444]'
    },
    {
      title: 'Taxa de Resposta',
      value: `${responseRate.toFixed(1)}%`,
      icon: <MessageSquare className="w-4 h-4 text-[#00A3FF]" />,
      percentage: '+2.1%',
      isPositive: true,
      color: 'from-[#00A3FF]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map((card, i) => (
        <div key={i} className="glass-panel p-4 relative flex flex-col justify-between h-[105px] overflow-hidden group">
          <div className={clsx("absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl to-transparent opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-bl-full pointer-events-none", card.color)}></div>
          
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                {card.icon}
              </div>
            </div>
            
            <div className={clsx(
              "px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider",
              card.isPositive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"
            )}>
              {card.isPositive ? '↗' : '↘'} {card.percentage}
            </div>
          </div>
          
          <div className="mt-2 z-10">
            <h3 className="text-gray-400 text-[9px] font-semibold mb-0.5 uppercase tracking-wider">{card.title}</h3>
            <p className="text-base font-bold tracking-wide text-white">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
