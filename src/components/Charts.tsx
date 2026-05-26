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
import { Line, Doughnut } from 'react-chartjs-2';
import type { DailyMetrics } from '../types';

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

interface Props {
  metrics: DailyMetrics[];
}

export function Charts({ metrics }: Props) {
  const lineData = {
    labels: metrics.map(m => m.date),
    datasets: [
      {
        label: 'Vendas LP',
        data: metrics.map(m => m.lpRevenue),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Tráfego Pago',
        data: metrics.map(m => m.adSpend),
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(20, 20, 22, 0.9)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#6b7280', font: { size: 9 } },
        border: { display: false }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const latest = metrics[metrics.length - 1];
  const replied = latest ? latest.messagesReplied : 0;
  const sent = latest ? latest.messagesSent : 0;
  const unreplied = sent - replied;
  
  const doughnutData = {
    labels: ['Respondidas', 'Não Respondidas'],
    datasets: [
      {
        data: [replied, unreplied],
        backgroundColor: ['#00A3FF', '#9333EA'],
        borderWidth: 0,
        borderRadius: 20, 
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: 270,
    cutout: '80%',
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      {/* Line Chart */}
      <div className="glass-panel p-4 flex flex-col h-[200px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-white">Balanço (R$)</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_5px_#10B981]"></span>
               <span className="text-[9px] text-gray-400">Vendas LP</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_5px_#EF4444]"></span>
               <span className="text-[9px] text-gray-400">Tráfego</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[120px]">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
      
      {/* Gauge Chart */}
      <div className="glass-panel p-4 relative flex flex-col justify-between h-[200px]">
        <div className="flex justify-between items-center mb-1">
           <h3 className="text-xs font-semibold text-white">Funil de Mensagens</h3>
           <span className="text-[9px] text-gray-400">Hoje</span>
        </div>
        <div className="flex-1 min-h-[100px] relative flex items-center justify-center pt-8">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
            <span className="text-xl font-bold text-white">{sent}</span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Enviadas</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 pb-1">
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></span>
                 <span className="text-[9px] text-gray-400">Respondidas</span>
               </div>
               <span className="text-[11px] font-bold text-white mt-0.5">{replied}</span>
            </div>
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
                 <span className="text-[9px] text-gray-400">Não Respondidas</span>
               </div>
               <span className="text-[11px] font-bold text-white mt-0.5">{unreplied}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
