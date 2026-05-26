import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlannerEvent {
  id: string;
  title: string;
  date: string;
}

interface Props {
  userId: string | null;
}

export function Planner({ userId }: Props) {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modal State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  useEffect(() => {
    loadEvents();
  }, [userId]);

  async function loadEvents() {
    if (!userId) return;
    const { data } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (data) setEvents(data);
    setLoading(false);
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDate || !userId) return;

    const { data } = await supabase
      .from('planner_events')
      .insert([{ user_id: userId, title: newEventTitle.trim(), date: selectedDate }])
      .select()
      .single();

    if (data) {
      setEvents([...events, data].sort((a, b) => a.date.localeCompare(b.date)));
      setNewEventTitle('');
    }
  }

  async function deleteEvent(id: string) {
    if (!userId) return;
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

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0055FF]/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Planejamento</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Clique em qualquer dia para adicionar focos e metas.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#111318] border border-white/5 rounded-xl px-2 py-1">
          <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium capitalize w-32 text-center tracking-wide">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="holo-panel p-6">
        <div className="grid grid-cols-7 gap-px bg-white/5 rounded-lg overflow-hidden border border-white/10">
          
          {/* Weekday Headers */}
          {weekDays.map(day => (
            <div key={day} className="bg-[#111318] py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
              {day}
            </div>
          ))}

          {/* Days */}
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = groupedEvents[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(dateStr)}
                className={`bg-[#111318] min-h-[100px] p-2 flex flex-col cursor-pointer transition-colors hover:bg-white/5 group border-t border-white/5 ${isCurrentMonth ? '' : 'opacity-40'} ${isToday ? 'bg-[#00A3FF]/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-[#00A3FF] text-white shadow-[0_0_10px_rgba(0,163,255,0.4)]' : 'text-gray-300 group-hover:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A3FF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A3FF]"></span>
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="text-[10px] text-gray-400 truncate bg-white/5 rounded px-1.5 py-0.5 border border-white/5">
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-500 font-medium pl-1">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/10 w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  {format(parseISO(selectedDate), "EEEE", { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-400">
                  {format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6">
              
              {/* Form */}
              <form onSubmit={addEvent} className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#00A3FF]">Novo Foco</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reunião com equipe..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="flex-1 bg-[#151210] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm"
                  />
                  <button type="submit" className="bg-[#00A3FF] text-white p-2.5 rounded-xl hover:bg-[#008AE6] transition-colors flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Event List */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3 block">Focos do Dia</label>
                <div className="space-y-2">
                  {(groupedEvents[selectedDate] || []).length === 0 ? (
                    <p className="text-gray-600 text-sm italic text-center py-4 bg-white/5 rounded-xl border border-white/5 border-dashed">Nenhum foco definido para este dia.</p>
                  ) : (
                    (groupedEvents[selectedDate] || []).map(event => (
                      <div key={event.id} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 bg-[#00A3FF] rounded-full"></span>
                          <span className="text-gray-200 text-sm font-medium">{event.title}</span>
                        </div>
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          className="text-gray-600 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
