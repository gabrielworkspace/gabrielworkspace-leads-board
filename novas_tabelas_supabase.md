-- Tabela de Tarefas Diárias
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Planejamento (Calendário)
CREATE TABLE planner_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Projetos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Em Andamento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar segurança, mas liberar todas as portas para o nosso Dashboard
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Regras para Tasks
CREATE POLICY "Permitir Leitura Tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Permitir Insercao Tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Atualizacao Tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Permitir Delecao Tasks" ON tasks FOR DELETE USING (true);

-- Regras para Planner
CREATE POLICY "Permitir Leitura Planner" ON planner_events FOR SELECT USING (true);
CREATE POLICY "Permitir Insercao Planner" ON planner_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Atualizacao Planner" ON planner_events FOR UPDATE USING (true);
CREATE POLICY "Permitir Delecao Planner" ON planner_events FOR DELETE USING (true);

-- Regras para Projetos
CREATE POLICY "Permitir Leitura Projetos" ON projects FOR SELECT USING (true);
CREATE POLICY "Permitir Insercao Projetos" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Atualizacao Projetos" ON projects FOR UPDATE USING (true);
CREATE POLICY "Permitir Delecao Projetos" ON projects FOR DELETE USING (true);
