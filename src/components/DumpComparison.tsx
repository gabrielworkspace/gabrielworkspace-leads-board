import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

interface ComparisonData {
  gabriel: {
    messagesSent: number;
    messagesReplied: number;
    adSpend: number;
    lpRevenue: number;
    leadsCount: number;
  };
  mateus: {
    messagesSent: number;
    messagesReplied: number;
    adSpend: number;
    lpRevenue: number;
    leadsCount: number;
  };
}

export function DumpComparison() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComparisonData>({
    gabriel: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, leadsCount: 0 },
    mateus: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, leadsCount: 0 }
  });

  useEffect(() => {
    async function fetchData() {
      // Fetch metrics for last 30 days for both users
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('*')
        .in('user_id', ['gabriel', 'mateus'])
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const { data: leadsData } = await supabase
        .from('leads')
        .select('user_id')
        .in('user_id', ['gabriel', 'mateus']);

      const result: ComparisonData = {
        gabriel: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, leadsCount: 0 },
        mateus: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, leadsCount: 0 }
      };

      if (metricsData) {
        metricsData.forEach(m => {
          const user = m.user_id as 'gabriel' | 'mateus';
          if (result[user]) {
            result[user].messagesSent += (m.messagessent || 0);
            result[user].messagesReplied += (m.messagesreplied || 0);
            result[user].adSpend += (m.adspend || 0);
            result[user].lpRevenue += (m.lprevenue || 0);
          }
        });
      }

      if (leadsData) {
        leadsData.forEach(l => {
          const user = l.user_id as 'gabriel' | 'mateus';
          if (result[user]) {
            result[user].leadsCount += 1;
          }
        });
      }

      setData(result);
      setLoading(false);
    }
    
    fetchData();
  }, []);

  const total = useMemo(() => {
    return {
      messagesSent: data.gabriel.messagesSent + data.mateus.messagesSent,
      messagesReplied: data.gabriel.messagesReplied + data.mateus.messagesReplied,
      adSpend: data.gabriel.adSpend + data.mateus.adSpend,
      lpRevenue: data.gabriel.lpRevenue + data.mateus.lpRevenue,
      leadsCount: data.gabriel.leadsCount + data.mateus.leadsCount,
    };
  }, [data]);

  const chartData = {
    labels: ['Gabriel', 'Mateus'],
    datasets: [
      {
        label: 'Receita (R$)',
        data: [data.gabriel.lpRevenue, data.mateus.lpRevenue],
        backgroundColor: ['rgba(255, 107, 0, 0.8)', 'rgba(204, 85, 0, 0.8)'],
        borderColor: ['#FF6B00', '#CC5500'],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#CC5500] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Comparação Agência Dump</h1>
          <p className="text-gray-400 text-sm">Desempenho acumulado (Últimos 30 dias)</p>
        </div>
      </div>

      {/* SUM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="holo-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-gray-400 text-sm font-medium">Faturamento Total (Soma)</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total.lpRevenue)}
          </p>
        </div>

        <div className="holo-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-gray-400 text-sm font-medium">Gasto em Ads (Soma)</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total.adSpend)}
          </p>
        </div>

        <div className="holo-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-gray-400 text-sm font-medium">Mensagens Enviadas (Soma)</h3>
          </div>
          <p className="text-3xl font-bold text-white">{total.messagesSent}</p>
        </div>

        <div className="holo-panel p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-gray-400 text-sm font-medium">Leads Totais (Soma)</h3>
          </div>
          <p className="text-3xl font-bold text-white">{total.leadsCount}</p>
        </div>
      </div>

      {/* COMPARISON SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="holo-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Comparativo de Receita</h3>
          <div className="h-64 flex justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="holo-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Detalhamento por Usuário</h3>
          
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5">
              <h4 className="text-[#FF6B00] font-bold mb-3">Gabriel</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Receita:</span> <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.gabriel.lpRevenue)}</span></div>
                <div><span className="text-gray-400">Gasto Ads:</span> <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.gabriel.adSpend)}</span></div>
                <div><span className="text-gray-400">Msgs Env:</span> <span className="text-white font-medium">{data.gabriel.messagesSent}</span></div>
                <div><span className="text-gray-400">Leads:</span> <span className="text-white font-medium">{data.gabriel.leadsCount}</span></div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5">
              <h4 className="text-[#FF6B00] font-bold mb-3">Mateus</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Receita:</span> <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.mateus.lpRevenue)}</span></div>
                <div><span className="text-gray-400">Gasto Ads:</span> <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.mateus.adSpend)}</span></div>
                <div><span className="text-gray-400">Msgs Env:</span> <span className="text-white font-medium">{data.mateus.messagesSent}</span></div>
                <div><span className="text-gray-400">Leads:</span> <span className="text-white font-medium">{data.mateus.leadsCount}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
