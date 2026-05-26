import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, Send, MessageCircle, DollarSign, Loader2, Award } from 'lucide-react';
import type { DailyMetrics } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BestRecords {
  revenue: DailyMetrics | null;
  sent: DailyMetrics | null;
  replies: DailyMetrics | null;
}

export function BestDays() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<BestRecords>({
    revenue: null,
    sent: null,
    replies: null,
  });

  useEffect(() => {
    async function fetchBestDays() {
      // Dia com maior faturamento
      const { data: revenueData } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('lprevenue', { ascending: false })
        .limit(1);

      // Dia com mais envios
      const { data: sentData } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('messagessent', { ascending: false })
        .limit(1);

      // Dia com mais respostas
      const { data: repliesData } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('messagesreplied', { ascending: false })
        .limit(1);

      const mapData = (arr: any[] | null): DailyMetrics | null => {
        if (!arr || arr.length === 0) return null;
        const m = arr[0];
        return {
          date: m.date,
          messagesSent: m.messagessent || 0,
          messagesReplied: m.messagesreplied || 0,
          adSpend: m.adspend || 0,
          lpRevenue: m.lprevenue || 0,
        };
      };

      setRecords({
        revenue: mapData(revenueData),
        sent: mapData(sentData),
        replies: mapData(repliesData),
      });

      setLoading(false);
    }

    fetchBestDays();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nenhum dado';
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined) return 'R$ 0,00';
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      
      {/* Header */}
      <div className="holo-panel p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.08] transition-opacity duration-700"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Hall da Fama</h2>
        </div>
        <p className="text-gray-400 text-sm ml-13">Aqui estão registrados os seus maiores picos de performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Record: Faturamento */}
        <div className="holo-panel p-6 border-t-4 border-t-[#10B981] flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="w-8 h-8 text-[#10B981]" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Maior Faturamento</h3>
          <p className="text-3xl font-black text-white mb-4">{formatCurrency(records.revenue?.lpRevenue)}</p>
          <div className="bg-[#111318] w-full p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-gray-300">{formatDate(records.revenue?.date)}</span>
          </div>
        </div>

        {/* Record: Envios */}
        <div className="holo-panel p-6 border-t-4 border-t-[#3B82F6] flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Send className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Dia Mais Produtivo</h3>
          <p className="text-3xl font-black text-white mb-4">{records.sent?.messagesSent || 0} <span className="text-lg font-medium text-gray-500">envios</span></p>
          <div className="bg-[#111318] w-full p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-sm font-medium text-gray-300">{formatDate(records.sent?.date)}</span>
          </div>
        </div>

        {/* Record: Respostas */}
        <div className="holo-panel p-6 border-t-4 border-t-[#8B5CF6] flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Maior Engajamento</h3>
          <p className="text-3xl font-black text-white mb-4">{records.replies?.messagesReplied || 0} <span className="text-lg font-medium text-gray-500">respostas</span></p>
          <div className="bg-[#111318] w-full p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-medium text-gray-300">{formatDate(records.replies?.date)}</span>
          </div>
        </div>

      </div>

      {/* Dica */}
      <div className="mt-8 bg-gradient-to-r from-[#00A3FF]/10 to-transparent border-l-4 border-[#00A3FF] p-6 rounded-r-2xl flex items-start gap-4">
        <TrendingUp className="w-6 h-6 text-[#00A3FF] shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-bold mb-1">Como usar essa tela?</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Seu objetivo é quebrar esses recordes constantemente. Observe o "Dia Mais Produtivo". Qual foi a sua rotina naquele dia? Tente replicar aquele comportamento para elevar a barra ainda mais alto.
          </p>
        </div>
      </div>

    </div>
  );
}
