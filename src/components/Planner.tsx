import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlannerEvent {
  id: string;
  title: string;
  date: string;
}

export function Planner() {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('planner_events')
      .select('*')
      .gte('date', today) // Somente eventos de hoje em diante
      .order('date', { ascending: true });
    
    if (data) setEvents(data);
    setLoading(false);
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const { data } = await supabase
      .from('planner_events')
      .insert([{ title: newEventTitle.trim(), date: newEventDate }])
      .select()
      .single();

    if (data) {
      setEvents([...events, data].sort((a, b) => a.date.localeCompare(b.date)));
      setNewEventTitle('');
      setIsAdding(false);
    }
  }

  async function deleteEvent(id: string) {
    setEvents(events.filter(e => e.id !== id));
    await supabase.from('planner_events').delete().eq('id', id);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
      </div>
    );
  }

  // Agrupar eventos por data
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, PlannerEvent[]>);

  // Gerar os próximos 7 dias para mostrar mesmo se não tiver eventos
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return format(d, 'yyyy-MM-dd');
  });

  // Pegar datas que têm eventos mas estão além dos 7 dias
  const futureDates = Object.keys(groupedEvents).filter(d => !next7Days.includes(d)).sort();
  
  const displayDates = [...next7Days, ...futureDates];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0055FF]/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Planejamento</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Defina as metas e focos para os próximos dias.</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Foco
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={addEvent} className="holo-panel p-6 animate-in slide-in-from-top-4 fade-in">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">Agendar Foco / Meta</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              required
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors sm:w-48"
            />
            <input
              type="text"
              required
              placeholder="Ex: Lançar nova campanha no FB Ads"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors"
            />
            <button type="submit" className="bg-[#00A3FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#008AE6] transition-colors">
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Agenda/List */}
      <div className="space-y-4 mt-4">
        {displayDates.map(dateStr => {
          const dateObj = parseISO(dateStr);
          const isToday = isSameDay(dateObj, new Date());
          const dayEvents = groupedEvents[dateStr] || [];

          return (
            <div key={dateStr} className={`holo-panel p-0 overflow-hidden border-l-4 ${isToday ? 'border-l-[#00A3FF]' : 'border-l-transparent'}`}>
              <div className="bg-black/20 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className={`font-bold ${isToday ? 'text-[#00A3FF]' : 'text-gray-300'}`}>
                    {isToday ? 'Hoje' : format(dateObj, "EEEE", { locale: ptBR })}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium tracking-wide">
                    {format(dateObj, "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
                <button 
                  onClick={() => { setIsAdding(true); setNewEventDate(dateStr); }}
                  className="text-[#00A3FF] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="p-4">
                {dayEvents.length === 0 ? (
                  <p className="text-gray-600 text-sm italic">Nenhum foco definido para este dia.</p>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div key={event.id} className="group flex items-center justify-between p-3 bg-[#111318] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <ChevronRight className="w-4 h-4 text-[#00A3FF]" />
                          <span className="text-gray-200">{event.title}</span>
                        </div>
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          className="text-gray-600 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
