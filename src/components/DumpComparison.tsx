import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Award, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';

interface ComparisonData {
  gabriel: {
    messagesSent: number;
    messagesReplied: number;
    adSpend: number;
    lpRevenue: number;
    organicRevenue: number;
    profit: number;
    leadsCount: number;
  };
  matheus: {
    messagesSent: number;
    messagesReplied: number;
    adSpend: number;
    lpRevenue: number;
    organicRevenue: number;
    profit: number;
    leadsCount: number;
  };
}

interface LeadDisplay {
  id: string;
  name: string;
  value: number;
  user_id: string;
  date: string;
}

export function DumpComparison() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComparisonData>({
    gabriel: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, organicRevenue: 0, profit: 0, leadsCount: 0 },
    matheus: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, organicRevenue: 0, profit: 0, leadsCount: 0 }
  });
  const [topLeads, setTopLeads] = useState<LeadDisplay[]>([]);
  const [timelineLabels, setTimelineLabels] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('*')
        .in('user_id', ['gabriel', 'matheus'])
        .gte('date', thirtyDaysStr);

      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, user_id, name, status, value, created_at')
        .in('user_id', ['gabriel', 'matheus']);

      const result: ComparisonData = {
        gabriel: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, organicRevenue: 0, profit: 0, leadsCount: 0 },
        matheus: { messagesSent: 0, messagesReplied: 0, adSpend: 0, lpRevenue: 0, organicRevenue: 0, profit: 0, leadsCount: 0 }
      };

      // Create a map for the timeline
      const dailyProfitMap = new Map<string, number>();
      
      // Initialize 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyProfitMap.set(d.toISOString().split('T')[0], 0);
      }

      if (metricsData) {
        metricsData.forEach(m => {
          const user = m.user_id as 'gabriel' | 'matheus';
          if (result[user]) {
            result[user].messagesSent += (m.messagessent || 0);
            result[user].messagesReplied += (m.messagesreplied || 0);
            result[user].adSpend += (m.adspend || 0);
            result[user].lpRevenue += (m.lprevenue || 0);
          }
          
          if (dailyProfitMap.has(m.date)) {
            const current = dailyProfitMap.get(m.date) || 0;
            const dailyNet = (m.lprevenue || 0) - (m.adspend || 0);
            dailyProfitMap.set(m.date, current + dailyNet);
          }
        });
      }

      const closedLeads: LeadDisplay[] = [];

      if (leadsData) {
        leadsData.forEach(l => {
          const user = l.user_id as 'gabriel' | 'matheus';
          if (result[user]) {
            result[user].leadsCount += 1;
            if (l.status === 'Closed' && l.value) {
              result[user].organicRevenue += l.value;
              
              closedLeads.push({
                id: l.id,
                name: l.name,
                value: l.value,
                user_id: user,
                date: l.created_at
              });

              // Add organic revenue to the specific date on timeline
              if (l.created_at) {
                const dateOnly = l.created_at.split('T')[0];
                if (dailyProfitMap.has(dateOnly)) {
                  const current = dailyProfitMap.get(dateOnly) || 0;
                  dailyProfitMap.set(dateOnly, current + l.value);
                }
              }
            }
          }
        });
      }

      // Calculate final profit
      ['gabriel', 'matheus'].forEach(user => {
        const u = user as 'gabriel' | 'matheus';
        result[u].profit = result[u].lpRevenue + result[u].organicRevenue - result[u].adSpend;
      });

      // Sort and get Top Leads
      closedLeads.sort((a, b) => b.value - a.value);
      setTopLeads(closedLeads);

      // Prepare timeline arrays (cumulative)
      const labels: string[] = [];
      const series: number[] = [];
      let cumulative = 0;
      
      dailyProfitMap.forEach((val, dateStr) => {
        const [, m, d] = dateStr.split('-');
        labels.push(`${d}/${m}`);
        cumulative += val;
        series.push(cumulative);
      });

      setTimelineLabels(labels);
      setTimelineData(series);
      setData(result);
      setLoading(false);
    }
    
    fetchData();
  }, []);

  const total = useMemo(() => {
    return {
      messagesSent: data.gabriel.messagesSent + data.matheus.messagesSent,
      messagesReplied: data.gabriel.messagesReplied + data.matheus.messagesReplied,
      adSpend: data.gabriel.adSpend + data.matheus.adSpend,
      lpRevenue: data.gabriel.lpRevenue + data.matheus.lpRevenue,
      organicRevenue: data.gabriel.organicRevenue + data.matheus.organicRevenue,
      profit: data.gabriel.profit + data.matheus.profit,
      leadsCount: data.gabriel.leadsCount + data.matheus.leadsCount,
    };
  }, [data]);

  const chartData: ChartData<'line'> = {
    labels: timelineLabels,
    datasets: [
      {
        label: 'Lucro Acumulado',
        data: timelineData,
        borderColor: '#00E5FF',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00E5FF',
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
          return gradient;
        }
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        titleColor: '#8892B0',
        bodyColor: '#00E5FF',
        borderColor: 'rgba(0, 229, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx: any) => `R$ ${ctx.raw.toLocaleString('pt-BR')}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: { color: '#6B7280', font: { size: 10 }, callback: (value: any) => `R$ ${value}` },
        border: { display: false }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#6B7280', font: { size: 10 }, maxTicksLimit: 6 },
        border: { display: false }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const highestLead = topLeads.length > 0 ? topLeads[0] : null;
  const lowestLead = topLeads.length > 0 ? topLeads[topLeads.length - 1] : null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#00A3FF]/20 border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <Activity className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Desempenho da Agência</h1>
            <p className="text-gray-400 text-sm">Visão consolidada e comparativo (Últimos 30 dias)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* YIELD OVERVIEW - Takes 2 cols */}
        <div className="lg:col-span-2 bg-[#0A0B0E] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle glow in background */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00E5FF] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Evolução de Lucro (Soma)</h3>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-light text-white tracking-wider">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total.profit)}
                </h2>
                <div className="flex items-center gap-1 text-[#00E5FF] text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full relative z-10">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* METRICS CARDS - Takes 1 col */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0A0B0E] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-[#00E5FF]/20 transition-colors">
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Faturamento Total</h3>
            <p className="text-2xl font-semibold text-white tracking-wide">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total.lpRevenue + total.organicRevenue)}
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00E5FF]" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-[#0A0B0E] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-[#00E5FF]/20 transition-colors">
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Total de Leads</h3>
            <p className="text-2xl font-semibold text-white tracking-wide">
              {total.leadsCount}
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00E5FF]" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-[#0A0B0E] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-[#00E5FF]/20 transition-colors">
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Gasto em Ads</h3>
            <p className="text-2xl font-semibold text-white tracking-wide">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total.adSpend)}
            </p>
          </div>
        </div>
      </div>

      {/* COMPARATIVE METRICS & TOP LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMPARATIVE */}
        <div className="bg-[#0A0B0E] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-lg font-medium text-white mb-6">Comparativo por Especialista</h3>
          
          <div className="space-y-6">
            {/* Gabriel */}
            <div className="bg-[#12141A] rounded-xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#00A3FF] opacity-5 rounded-full blur-[50px]"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00A3FF]/20 flex items-center justify-center text-[#00A3FF] font-bold text-sm">G</div>
                  <h4 className="text-white font-medium">Gabriel</h4>
                </div>
                <span className="text-[#00E5FF] font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.gabriel.profit)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Receita</span>
                  <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.gabriel.lpRevenue + data.gabriel.organicRevenue)}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Leads</span>
                  <span className="text-white font-medium">{data.gabriel.leadsCount}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Msgs Env.</span>
                  <span className="text-white font-medium">{data.gabriel.messagesSent}</span>
                </div>
              </div>
            </div>

            {/* Matheus */}
            <div className="bg-[#12141A] rounded-xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#00E5FF] opacity-5 rounded-full blur-[50px]"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] font-bold text-sm">M</div>
                  <h4 className="text-white font-medium">Matheus</h4>
                </div>
                <span className="text-[#00E5FF] font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.matheus.profit)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Receita</span>
                  <span className="text-white font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.matheus.lpRevenue + data.matheus.organicRevenue)}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Leads</span>
                  <span className="text-white font-medium">{data.matheus.leadsCount}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <span className="block text-gray-500 mb-1">Msgs Env.</span>
                  <span className="text-white font-medium">{data.matheus.messagesSent}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP LEADS */}
        <div className="bg-[#0A0B0E] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Principais Leads (Fechados)</h3>
            <Award className="w-5 h-5 text-[#00E5FF]" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#12141A] rounded-xl p-4 border border-white/5">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><ArrowUpRight className="w-3 h-3 text-[#00E5FF]" /> Maior Valor</span>
              <p className="text-white font-medium truncate">{highestLead?.name || 'N/A'}</p>
              <p className="text-lg font-bold text-[#00E5FF] mt-1">{highestLead ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(highestLead.value) : 'R$ 0,00'}</p>
            </div>
            <div className="bg-[#12141A] rounded-xl p-4 border border-white/5">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><ArrowDownRight className="w-3 h-3 text-[#EF4444]" /> Menor Valor</span>
              <p className="text-white font-medium truncate">{lowestLead?.name || 'N/A'}</p>
              <p className="text-lg font-bold text-white mt-1">{lowestLead ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lowestLead.value) : 'R$ 0,00'}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-white/5">
                  <th className="pb-3 font-medium">Nome do Lead</th>
                  <th className="pb-3 font-medium">Resp.</th>
                  <th className="pb-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.slice(0, 10).map((lead, idx) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-sm text-white flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-4">{idx + 1}.</span>
                      <span className="truncate max-w-[120px] sm:max-w-[180px]">{lead.name}</span>
                    </td>
                    <td className="py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${lead.user_id === 'gabriel' ? 'bg-[#00A3FF]/20 text-[#00A3FF]' : 'bg-[#00E5FF]/20 text-[#00E5FF]'}`}>
                        {lead.user_id === 'gabriel' ? 'G' : 'M'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-[#00E5FF] font-medium text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                    </td>
                  </tr>
                ))}
                {topLeads.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 text-sm">
                      Nenhum lead fechado no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
