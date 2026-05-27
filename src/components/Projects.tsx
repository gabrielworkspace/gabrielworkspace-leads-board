import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layers, Plus, Trash2, Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  service?: string;
  observations?: string;
  topics?: string;
}

const STATUSES = ['Em Planejamento', 'Em Andamento', 'Concluído'];

interface Props {
  userId?: string | null;
}

export function Projects({ userId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectService, setNewProjectService] = useState('');
  const [newProjectTopics, setNewProjectTopics] = useState('');
  const [newProjectObs, setNewProjectObs] = useState('');

  useEffect(() => {
    if (userId) {
      loadProjects();
    }
  }, [userId]);

  async function loadProjects() {
    if (!userId) return;
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setProjects(data);
    setLoading(false);
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ 
        user_id: userId, 
        name: newProjectName.trim(), 
        status: 'Em Planejamento',
        service: newProjectService.trim(),
        topics: newProjectTopics.trim(),
        observations: newProjectObs.trim()
      }])
      .select()
      .single();

    if (error) {
      alert(`Erro ao criar projeto: ${error.message}\n\nLembre-se de adicionar as colunas 'service', 'topics' e 'observations' na tabela 'projects' do Supabase.`);
      return;
    }

    if (data) {
      setProjects([data, ...projects]);
      setNewProjectName('');
      setNewProjectService('');
      setNewProjectTopics('');
      setNewProjectObs('');
      setIsAdding(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
    await supabase.from('projects').update({ status: newStatus }).eq('id', id);
  }

  async function deleteProject(id: string) {
    setProjects(projects.filter(p => p.id !== id));
    await supabase.from('projects').delete().eq('id', id);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0055FF]/20 to-[#6D28D9]/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#0055FF]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Meus Projetos</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13">Gerencie suas grandes iniciativas e acompanhe o status.</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#0055FF] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Projeto
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={addProject} className="holo-panel p-6 animate-in slide-in-from-top-4 fade-in max-w-2xl">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-white/5 pb-2">Iniciar Novo Projeto</h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Nome do Projeto (Ex: Refazer Site Principal)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0055FF] transition-colors"
            />
            <input
              type="text"
              placeholder="Serviço (Ex: Web Design, Consultoria)"
              value={newProjectService}
              onChange={(e) => setNewProjectService(e.target.value)}
              className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0055FF] transition-colors"
            />
            <textarea
              placeholder="Tópicos de alteração (Ex: Ajuste na Home, Nova página de Contato...)"
              value={newProjectTopics}
              onChange={(e) => setNewProjectTopics(e.target.value)}
              rows={2}
              className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0055FF] transition-colors resize-none"
            />
            <textarea
              placeholder="Observações adicionais..."
              value={newProjectObs}
              onChange={(e) => setNewProjectObs(e.target.value)}
              rows={2}
              className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0055FF] transition-colors resize-none"
            />
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-[#0055FF] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7C3AED] transition-colors">
                Criar Projeto
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {STATUSES.map(status => {
          const columnProjects = projects.filter(p => p.status === status);
          
          let headerColor = "text-gray-400 border-gray-400/20";
          if (status === 'Em Andamento') headerColor = "text-[#00A3FF] border-[#00A3FF]/20";
          if (status === 'Concluído') headerColor = "text-[#00A3FF] border-[#00A3FF]/20";

          return (
            <div key={status} className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-4 flex flex-col gap-4">
              <div className={`flex items-center justify-between border-b pb-3 ${headerColor}`}>
                <h3 className="font-bold uppercase tracking-widest text-xs">{status}</h3>
                <span className="bg-[#111318] text-xs px-2 py-1 rounded-md font-bold">{columnProjects.length}</span>
              </div>

              <div className="flex flex-col gap-3 min-h-[150px]">
                {columnProjects.length === 0 && (
                  <div className="text-center py-8 opacity-50">
                    <p className="text-xs text-gray-500">Nenhum projeto aqui</p>
                  </div>
                )}
                
                {columnProjects.map(project => (
                  <div key={project.id} className="bg-[#111318] border border-white/10 p-4 rounded-2xl group hover:border-[#0055FF]/50 transition-colors flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-200 leading-tight pr-4">{project.name}</h4>
                      <button 
                        onClick={() => deleteProject(project.id)}
                        className="text-gray-600 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {project.service && (
                      <div className="text-xs text-[#00A3FF] font-medium bg-[#00A3FF]/10 inline-flex px-2 py-1 rounded w-max">
                        {project.service}
                      </div>
                    )}
                    
                    {project.topics && (
                      <div className="text-xs text-gray-400">
                        <strong className="text-gray-300 block mb-0.5">Tópicos:</strong> 
                        <span className="whitespace-pre-wrap">{project.topics}</span>
                      </div>
                    )}

                    {project.observations && (
                      <div className="text-xs text-gray-400">
                        <strong className="text-gray-300 block mb-0.5">Obs:</strong> 
                        <span className="whitespace-pre-wrap">{project.observations}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 font-medium">Mover para:</span>
                      <select 
                        value={project.status}
                        onChange={(e) => updateStatus(project.id, e.target.value)}
                        className="bg-black/50 border border-white/5 text-xs text-gray-300 rounded-lg px-2 py-1 outline-none focus:border-[#0055FF] cursor-pointer"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
