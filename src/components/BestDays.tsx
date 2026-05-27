import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, DollarSign, Loader2, Award } from 'lucide-react';
import type { DailyMetrics } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  userId: string | null;
}

export function BestDays({ userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [topDays, setTopDays] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    async function fetchBestDays() {
      if (!userId) return;

      const { data } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('lprevenue', { ascending: false })
        .order('date', { ascending: false })
        .limit(3);

      if (data) {
        setTopDays(data.map(m => ({
          date: m.date,
          messagesSent: m.messagessent || 0,
          messagesReplied: m.messagesreplied || 0,
          adSpend: m.adspend || 0,
          lpRevenue: m.lprevenue || 0,
        })));
      }

      setLoading(false);
    }

    fetchBestDays();
  }, [userId]);

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

  const rankStyles = [
    { border: "border-t-[#F59E0B]", bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", label: "1º LUGAR" },
    { border: "border-t-[#94A3B8]", bg: "bg-[#94A3B8]/10", text: "text-[#94A3B8]", label: "2º LUGAR" },
    { border: "border-t-[#B45309]", bg: "bg-[#B45309]/10", text: "text-[#B45309]", label: "3º LUGAR" },
  ];

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
        <p className="text-gray-400 text-sm ml-13">Aqui estão registrados os seus maiores picos de performance em faturamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => {
          const day = topDays[index];
          const style = rankStyles[index];

          return (
            <div key={index} className={`holo-panel p-6 border-t-4 ${style.border} flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300`}>
              <div className={`w-16 h-16 rounded-full ${style.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <DollarSign className={`w-8 h-8 ${style.text}`} />
              </div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{style.label}</h3>
              <p className="text-3xl font-black text-white mb-4">{formatCurrency(day?.lpRevenue)}</p>
              <div className="bg-[#111318] w-full p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
                <Award className={`w-4 h-4 ${style.text}`} />
                <span className="text-sm font-medium text-gray-300">{formatDate(day?.date)}</span>
              </div>
            </div>
          );
        })}
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
