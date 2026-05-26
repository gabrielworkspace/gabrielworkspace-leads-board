import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckSquare, Circle, CheckCircle2, Trash2, Plus, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    // Only load tasks created today (since it's Daily Tasks)
    // Or we could just load uncompleted tasks + today's completed tasks
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

    const { data } = await supabase
      .from('tasks')
      .insert([{ title: newTaskTitle.trim() }])
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      
      {/* Header & Progress */}
      <div className="holo-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.05] transition-opacity duration-700"></div>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#0055FF]/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Tarefas Diárias</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Organize seu foco e garanta que o principal seja feito.</p>
        </div>

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
      </div>

      {/* Input */}
      <form onSubmit={addTask} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00A3FF] to-[#0055FF] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative flex items-center bg-[#111318] rounded-2xl border border-white/10 p-2 shadow-2xl">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Qual é a sua próxima missão de hoje?"
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
        {tasks.length === 0 ? (
          <div className="text-center py-16 border border-white/5 rounded-3xl bg-[#0A0A0A]">
            <CheckSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma tarefa para hoje. Tire o dia para descansar ou adicione uma nova!</p>
          </div>
        ) : (
          tasks.map(task => (
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
  );
}
