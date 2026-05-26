import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { CheckSquare, Circle, CheckCircle2, Trash2, Plus, Loader2, BarChart2, Calendar, ListTodo } from 'lucide-react';
import { clsx } from 'clsx';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, parseISO, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface DailyTasksProps {
  dateFilter?: string;
}

export function DailyTasks({ dateFilter = '1' }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [historyPeriod, setHistoryPeriod] = useState<7 | 30>(7);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setTasks(data);
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetDate = new Date();
    if (dateFilter === 'yesterday') {
      targetDate.setDate(targetDate.getDate() - 1);
    }

    const insertData: any = { title: newTaskTitle.trim() };
    if (dateFilter === 'yesterday') {
      insertData.created_at = targetDate.toISOString();
    }

    const { data } = await supabase
      .from('tasks')
      .insert([insertData])
      .select()
      .single();

    if (data) {
      setTasks([...tasks, data]);
      setNewTaskTitle('');
    }
  }

  async function toggleTask(task: Task) {
    const updatedStatus = !task.completed;
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));

    await supabase
      .from('tasks')
      .update({ completed: updatedStatus })
      .eq('id', task.id);
  }

  async function deleteTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  }

  // --- Data Processing ---
  const targetDate = useMemo(() => {
    const d = new Date();
    if (dateFilter === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    return d;
  }, [dateFilter]);
  
  // Today's tasks (or selected date tasks)
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      const createdDate = new Date(t.created_at);
      // Show if it was created on the target date OR if it's uncompleted (carries over)
      return isSameDay(createdDate, targetDate) || !t.completed;
    });
  }, [tasks, targetDate]);

  // History Tasks
  const historyData = useMemo(() => {
    const cutoffDate = subDays(new Date(), historyPeriod);
    const filtered = tasks.filter(t => new Date(t.created_at) >= cutoffDate);
    
    const grouped = filtered.reduce((acc, task) => {
      const dateStr = format(new Date(task.created_at), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = { total: 0, completed: 0, tasks: [] };
      }
      acc[dateStr].total++;
      if (task.completed) acc[dateStr].completed++;
      acc[dateStr].tasks.push(task);
      return acc;
    }, {} as Record<string, { total: number; completed: number; tasks: Task[] }>);

    const sortedDates = Object.keys(grouped).sort();
    
    return {
      grouped,
      sortedDates
    };
  }, [tasks, historyPeriod, now]);

  const chartData = {
    labels: historyData.sortedDates.map(d => format(parseISO(d), 'dd/MM', { locale: ptBR })),
    datasets: [
      {
        label: 'Criadas',
        data: historyData.sortedDates.map(d => historyData.grouped[d].total),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
      },
      {
        label: 'Concluídas',
        data: historyData.sortedDates.map(d => historyData.grouped[d].completed),
        backgroundColor: '#00A3FF',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9CA3AF', stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { display: false }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
      </div>
    );
  }

  const completedCount = todayTasks.filter(t => t.completed).length;
  const progress = todayTasks.length === 0 ? 0 : Math.round((completedCount / todayTasks.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="holo-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.05] transition-opacity duration-700"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0055FF]/20 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-[#00A3FF]" />
              </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {dateFilter === 'yesterday' ? 'Tarefas de Ontem' : 'Tarefas Diárias'}
            </h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Organize seu foco e acompanhe seu desempenho.</p>
          </div>

          {activeTab === 'today' && (
            <div className="flex items-center gap-4 bg-black/40 px-5 py-4 rounded-2xl border border-white/5 w-full sm:w-auto">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Progresso</p>
                <p className="text-xl font-bold text-white leading-none">{progress}%</p>
              </div>
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * progress) / 100} className="text-[#00A3FF] transition-all duration-1000 ease-out" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5 mx-auto sm:mx-0 inline-flex w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('today')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'today' ? 'bg-[#00A3FF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ListTodo size={16} /> {dateFilter === 'yesterday' ? 'Lista de Ontem' : 'Tarefas de Hoje'}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-[#00A3FF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart2 size={16} /> Histórico e Desempenho
          </button>
        </div>
      </div>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Input */}
          <form onSubmit={addTask} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00A3FF] to-[#0055FF] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-[#111318] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={dateFilter === 'yesterday' ? 'Qual era a sua missão para ontem?' : 'Qual é a sua próxima missão de hoje?'}
                className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none placeholder:text-gray-600 font-medium"
              />
              <button 
                type="submit" 
                disabled={!newTaskTitle.trim()}
                className="bg-[#00A3FF] hover:bg-[#008AE6] disabled:opacity-50 disabled:hover:bg-[#00A3FF] text-white p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,163,255,0.4)]"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-3 mt-4">
            {todayTasks.length === 0 ? (
              <div className="text-center py-16 border border-white/5 rounded-3xl bg-[#0A0A0A]">
                <CheckSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhuma tarefa para este dia.</p>
              </div>
            ) : (
              todayTasks.map(task => (
                <div 
                  key={task.id}
                  className={clsx(
                    "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                    task.completed 
                      ? "bg-[#0A0A0A] border-white/5 opacity-60" 
                      : "bg-[#111318] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => toggleTask(task)}
                  >
                    <button className="text-[#00A3FF] hover:scale-110 transition-transform">
                      {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 text-gray-500" />}
                    </button>
                    <span className={clsx(
                      "font-medium transition-all duration-300 select-none",
                      task.completed ? "text-gray-500 line-through decoration-gray-600" : "text-gray-200"
                    )}>
                      {task.title}
                    </span>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-600 hover:text-[#EF4444] hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all sm:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#00A3FF]" /> Desempenho
            </h3>
            <div className="flex bg-[#121212] rounded-lg border border-white/5 p-1">
              <button 
                onClick={() => setHistoryPeriod(7)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${historyPeriod === 7 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                7 Dias
              </button>
              <button 
                onClick={() => setHistoryPeriod(30)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${historyPeriod === 30 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                30 Dias
              </button>
            </div>
          </div>

          <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 h-[300px]">
            {historyData.sortedDates.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Nenhum dado encontrado no período.
              </div>
            )}
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#00A3FF]" /> Histórico de Tarefas
            </h3>
            
            <div className="space-y-6">
              {historyData.sortedDates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Não há tarefas neste período.</p>
              ) : (
                [...historyData.sortedDates].reverse().map(dateStr => {
                  const data = historyData.grouped[dateStr];
                  const formattedDate = format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: ptBR });
                  
                  return (
                    <div key={dateStr} className="bg-[#111318] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="font-semibold text-white capitalize">{formattedDate}</span>
                        <span className="text-xs font-medium text-gray-400">
                          {data.completed}/{data.total} concluídas
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        {data.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                            {task.completed ? <CheckCircle2 className="w-4 h-4 text-[#00A3FF]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                            <span className={clsx("text-sm", task.completed ? "text-gray-500 line-through" : "text-gray-300")}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
