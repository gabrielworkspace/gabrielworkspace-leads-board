import { DollarSign, Target, Send } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import type { DailyMetrics, Lead } from '../types';

interface Props {
  metrics: DailyMetrics[];
  leads: Lead[];
}

export function TopCards({ metrics, leads }: Props) {
  const latest = metrics[metrics.length - 1] || { lpRevenue: 0, adSpend: 0, messagesSent: 0, messagesReplied: 0 };
  const previous = metrics[metrics.length - 2] || { lpRevenue: 0, adSpend: 0, messagesSent: 0, messagesReplied: 0 };
  
  const netProfit = latest.lpRevenue - latest.adSpend;
  const prevNetProfit = previous.lpRevenue - previous.adSpend;
  
  // Real calculations based on leads!
  const totalSent = latest.messagesSent;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;
  const repliedLeads = leads.filter(l => l.status === 'Replied').length + closedLeads;
  const promisedLeads = leads.filter(l => l.status === 'Promised').length;
  // Ignored is the remaining sent messages minus those who replied or promised.
  const ignored = Math.max(0, totalSent - (repliedLeads + promisedLeads));
  
  const conversionRate = totalSent > 0 ? (repliedLeads / totalSent) * 100 : 0;
  
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false, min: 0 } },
    elements: { point: { radius: 0, hoverRadius: 0 } },
    layout: { padding: 0 }
  };

  const createSparkline = (dataFunc: (m: DailyMetrics) => number, color: string) => ({
    labels: metrics.map(m => m.date),
    datasets: [{
      data: metrics.map(dataFunc),
      borderColor: color,
      tension: 0.4,
      borderWidth: 2,
    }]
  });

  const gaugeData = {
    labels: ['Replied/Closed', 'Promised', 'Ignored/Lost'],
    datasets: [{
      data: [repliedLeads, promisedLeads, ignored],
      backgroundColor: ['#10B981', '#F5B041', '#9333EA'],
      borderWidth: 0,
      borderRadius: 5,
    }]
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: 270,
    cutout: '75%',
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return ` ${context.label}: ${context.raw}`;
          }
        }
      }
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 h-[220px]">
      
      {/* CARD 1 - MESSAGES SENT */}
      <div className="glass-panel p-5 flex flex-col justify-between col-span-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5B041]/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#F5B041]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Messages Sent</p>
              <h3 className="text-white text-xs font-medium">Outreach</h3>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold tracking-wide text-white">
              {latest.messagesSent}
            </p>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] mb-1">
              ↗ +15%
            </div>
          </div>
        </div>
        <div className="h-10 mt-3 relative">
           <Line data={createSparkline(m => m.messagesSent, '#F5B041')} options={sparklineOptions} />
           <div className="absolute inset-0 border-b border-dashed border-white/10 top-1/2"></div>
        </div>
      </div>

      {/* CARD 2 - TOTAL PROFIT */}
      <div className="glass-panel p-5 flex flex-col justify-between col-span-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Total Profit</p>
              <h3 className="text-white text-xs font-medium">Net Revenue</h3>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold tracking-wide text-white">
              R$ {netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] mb-1">
              ↗ +{(netProfit > prevNetProfit ? 12.5 : 0)}%
            </div>
          </div>
        </div>
        <div className="h-10 mt-3 relative">
           <Line data={createSparkline(m => m.lpRevenue - m.adSpend, '#10B981')} options={sparklineOptions} />
           <div className="absolute inset-0 border-b border-dashed border-white/10 top-1/2"></div>
        </div>
      </div>

      {/* CENTER - GAUGE */}
      <div className="glass-panel p-5 flex flex-col justify-between items-center relative col-span-2">
        <h3 className="text-xl font-bold text-white self-start">R$ {(latest.lpRevenue).toLocaleString('en-US')}</h3>
        <div className="flex items-center gap-2 self-start mt-1">
          <div className="w-4 h-4 rounded-full bg-[#00A3FF] flex items-center justify-center text-[8px] font-bold text-white">↗</div>
          <span className="text-[10px] text-gray-400">+{conversionRate.toFixed(1)}% Conversion Rate</span>
        </div>
        
        <div className="w-full h-[120px] mt-2 relative flex justify-center pt-4">
          <Doughnut data={gaugeData} options={gaugeOptions} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
            <span className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Conversion Rate</span>
          </div>
        </div>
        
        {/* Legend under gauge */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]"></span><span className="text-[9px] text-gray-400">Replied ({repliedLeads})</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F5B041]"></span><span className="text-[9px] text-gray-400">Promised ({promisedLeads})</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9333EA]"></span><span className="text-[9px] text-gray-400">Ignored ({ignored})</span></div>
        </div>
      </div>

      {/* CARD 3 - AD SPEND */}
      <div className="glass-panel p-5 flex flex-col justify-between col-span-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Ad Spend</p>
              <h3 className="text-white text-xs font-medium">Traffic</h3>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold tracking-wide text-white">
              R$ {latest.adSpend.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EF4444]/10 text-[#EF4444] mb-1">
              ↘ -2.4%
            </div>
          </div>
        </div>
        <div className="h-10 mt-3 relative">
           <Line data={createSparkline(m => m.adSpend, '#EF4444')} options={sparklineOptions} />
           <div className="absolute inset-0 border-b border-dashed border-white/10 top-1/2"></div>
        </div>
      </div>

    </div>
  );
}
