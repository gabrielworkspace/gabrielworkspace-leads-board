import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, ChevronRight, ChevronLeft, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';

interface PlannerEvent {
  id: string;
  title: string;
  date: string;
}

interface PlannerDay {
  id: string;
  date: string;
  success: boolean;
  notes: string;
}

interface Props {
  userId: string | null;
}

export function Planner({ userId }: Props) {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [plannerDays, setPlannerDays] = useState<Record<string, PlannerDay>>({});
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modal State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [daySuccess, setDaySuccess] = useState(false);
  const [dayNotes, setDayNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (selectedDate) {
      const dayData = plannerDays[selectedDate];
      setDaySuccess(dayData?.success || false);
      setDayNotes(dayData?.notes || '');
    } else {
      setDaySuccess(false);
      setDayNotes('');
    }
  }, [selectedDate, plannerDays]);

  async function loadData() {
    if (!userId) return;
    
    const [eventsData, daysData] = await Promise.all([
      supabase.from('planner_events').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('planner_days').select('*').eq('user_id', userId)
    ]);
    
    if (eventsData.data) setEvents(eventsData.data);
    if (daysData.data) {
      const daysRecord = daysData.data.reduce((acc, day) => {
        acc[day.date] = day;
        return acc;
      }, {} as Record<string, PlannerDay>);
      setPlannerDays(daysRecord);
    }
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

  const handleToggleSuccess = async () => {
    if (!selectedDate || !userId) return;
    const newSuccess = !daySuccess;
    setDaySuccess(newSuccess); // optimistic update
    
    const existing = plannerDays[selectedDate];
    let res;
    if (existing) {
      res = await supabase.from('planner_days').update({ success: newSuccess }).eq('id', existing.id).select().single();
    } else {
      res = await supabase.from('planner_days').insert([{ user_id: userId, date: selectedDate, success: newSuccess, notes: dayNotes }]).select().single();
    }
    if (res.data) setPlannerDays(prev => ({ ...prev, [selectedDate]: res.data }));
  };

  const handleNotesBlur = async () => {
    if (!selectedDate || !userId) return;
    const existing = plannerDays[selectedDate];
    const oldNotes = existing?.notes || '';
    if (oldNotes === dayNotes) return; // no change

    let res;
    if (existing) {
      res = await supabase.from('planner_days').update({ notes: dayNotes }).eq('id', existing.id).select().single();
    } else {
      res = await supabase.from('planner_days').insert([{ user_id: userId, date: selectedDate, success: daySuccess, notes: dayNotes }]).select().single();
    }
    if (res.data) setPlannerDays(prev => ({ ...prev, [selectedDate]: res.data }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#A3FF12] animate-spin" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3FF12]/20 to-[#8BE600]/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#A3FF12]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Planejamento</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Clique em qualquer dia para adicionar focos, metas e observações.</p>
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
            const dayData = plannerDays[dateStr];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(dateStr)}
                className={`bg-[#111318] min-h-[100px] p-2 flex flex-col cursor-pointer transition-all hover:bg-white/5 group border-t border-white/5 relative overflow-hidden ${isCurrentMonth ? '' : 'opacity-40'} ${isToday ? 'bg-[#A3FF12]/5' : ''}`}
              >
                {dayData?.success && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A3FF12]/10 to-transparent pointer-events-none"></div>
                )}
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className={clsx(
                    "w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isToday ? "bg-[#A3FF12] text-white shadow-[0_0_10px_rgba(0,163,255,0.4)]" : "text-gray-300 group-hover:text-white"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {dayData?.notes && <MessageSquare className="w-3 h-3 text-gray-500" />}
                    {dayData?.success && <CheckCircle2 className="w-4 h-4 text-[#A3FF12] drop-shadow-[0_0_5px_rgba(0,163,255,0.8)]" />}
                    {!dayData?.success && dayEvents.length > 0 && (
                      <span className="flex h-2 w-2 relative ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3FF12] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3FF12]"></span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 overflow-hidden relative z-10">
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
          <div className="bg-[#111318] border border-white/10 w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 relative overflow-hidden">
              <div className={clsx(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500",
                daySuccess ? "bg-[#A3FF12] opacity-20" : "opacity-0"
              )}></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                  {format(parseISO(selectedDate), "EEEE", { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-400">
                  {format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <button 
                  onClick={handleToggleSuccess}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 border",
                    daySuccess 
                      ? "bg-[#A3FF12]/10 text-[#A3FF12] border-[#A3FF12]/30 shadow-[0_0_15px_rgba(0,163,255,0.2)]" 
                      : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {daySuccess ? 'Sucesso!' : 'Concluir Dia'}
                </button>
                
                <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-8">
              
              {/* Event List & Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3 block">Focos do Dia</label>
                  <div className="space-y-2 mb-4">
                    {(groupedEvents[selectedDate] || []).length === 0 ? (
                      <p className="text-gray-600 text-sm italic py-2">Nenhum foco definido para este dia.</p>
                    ) : (
                      (groupedEvents[selectedDate] || []).map(event => (
                        <div key={event.id} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-[#A3FF12] rounded-full shadow-[0_0_5px_#A3FF12]"></span>
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

                <form onSubmit={addEvent} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar novo foco..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="flex-1 bg-[#151210] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#A3FF12] transition-colors text-sm"
                  />
                  <button type="submit" className="bg-[#A3FF12] text-white p-2.5 rounded-xl hover:bg-[#C6F432] transition-colors flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A3FF12] mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Observações do Resultado
                </label>
                <textarea
                  placeholder="Como foi o dia? Algum aprendizado ou nota sobre o planejamento?"
                  value={dayNotes}
                  onChange={(e) => setDayNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="w-full bg-[#151210] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#A3FF12] transition-colors text-sm min-h-[120px] resize-y placeholder:text-gray-600"
                ></textarea>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
