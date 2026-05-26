import { useState } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onLogin: (userId: string) => void;
}

export function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.toLowerCase().trim();
    if ((user === 'gabriel.workspace' || user === 'gabriel') && password === '12345678') {
      onLogin('gabriel');
    } else if (user === 'matheus' && password === '12345678') {
      onLogin('matheus');
    } else if (user === 'clarice' && password === '12345678') {
      onLogin('clarice');
    } else {
      setError(true);
    }
  };

  return (
    <div className="h-[100dvh] w-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      
      <div className="w-full max-w-md holo-panel p-10 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A3FF] to-[#0055FF] flex-shrink-0 shadow-[0_0_30px_rgba(0,163,255,0.3)] mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">Holo Workspace</h1>
          <p className="text-gray-400 text-sm mt-2">Área Restrita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Usuário</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors" 
              placeholder="Ex: gabriel.workspace" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00A3FF] transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          {error && (
            <p className="text-[#EF4444] text-xs font-medium text-center">Usuário ou senha incorretos.</p>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3 text-sm tracking-wide">
              Entrar no Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
