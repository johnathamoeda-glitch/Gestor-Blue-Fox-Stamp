import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { getSettings, saveSettings } from '../services/storageService';
import { Cloud, Check, Save, AlertCircle, Copy, Database } from 'lucide-react';
import { checkConnection } from '../services/supabaseClient';

export const Settings: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const current = getSettings();
    setSupabaseUrl(current.supabaseUrl || '');
    setSupabaseKey(current.supabaseKey || '');
    setAutoSync(current.autoSync || false);
  }, []);

  const handleSave = async () => {
    const newSettings: SystemSettings = { supabaseUrl, supabaseKey, autoSync };
    saveSettings(newSettings);
    
    // Test connection
    const isConnected = await checkConnection();
    if (isConnected) {
        setStatus('success');
        setTestResult('Conexão bem sucedida!');
    } else {
        setStatus('error');
        setTestResult('Não foi possível conectar. Verifique as credenciais.');
    }
    
    setTimeout(() => {
        if (isConnected) window.location.reload(); // Reload to start syncing
    }, 1500);
  };

  const sqlCode = `
-- Rode este código no SQL Editor do Supabase para criar as tabelas necessárias
create table if not exists orders (id text primary key, json_content jsonb);
create table if not exists activities (id text primary key, json_content jsonb);
create table if not exists expenses (id text primary key, json_content jsonb);
create table if not exists profit_calculations (id text primary key, json_content jsonb);
create table if not exists chat_messages (id text primary key, json_content jsonb);

-- Habilitar acesso público (apenas se não quiser configurar Row Level Security agora)
alter table orders enable row level security;
alter table activities enable row level security;
alter table expenses enable row level security;
alter table profit_calculations enable row level security;
alter table chat_messages enable row level security;

-- Políticas de acesso total (Cuidado: apenas para uso privado ou teste)
create policy "Public Access Orders" on orders for all using (true) with check (true);
create policy "Public Access Activities" on activities for all using (true) with check (true);
create policy "Public Access Expenses" on expenses for all using (true) with check (true);
create policy "Public Access Profits" on profit_calculations for all using (true) with check (true);
create policy "Public Access Chat" on chat_messages for all using (true) with check (true);
  `.trim();

  const handleCopySql = () => {
      navigator.clipboard.writeText(sqlCode);
      alert('Código SQL copiado!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Database size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Configurações de Nuvem</h2>
                <p className="text-gray-500 text-sm">Conecte seu banco de dados para sincronizar entre dispositivos.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <Cloud size={20} />
                    <h3 className="font-semibold">Credenciais do Supabase</h3>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                    <input 
                        type="text" 
                        value={supabaseUrl}
                        onChange={e => setSupabaseUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key (public/anon)</label>
                    <input 
                        type="password" 
                        value={supabaseKey}
                        onChange={e => setSupabaseKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                        className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input 
                        type="checkbox" 
                        id="autoSync"
                        checked={autoSync}
                        onChange={e => setAutoSync(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="autoSync" className="text-sm text-gray-700">Ativar sincronização automática</label>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Save size={18} />
                        Salvar e Conectar
                    </button>
                </div>

                {status !== 'idle' && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        {testResult}
                    </div>
                )}
            </div>

            {/* Tutorial */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 text-sm text-gray-600">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Como configurar (Grátis)
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" className="text-indigo-600 underline">supabase.com</a>.</li>
                    <li>Crie um "New Project" e dê um nome (ex: Gestor BFS).</li>
                    <li>Vá em <strong>Project Settings &gt; API</strong>. Copie a <code>Project URL</code> e a chave <code>anon public</code> e cole aqui ao lado.</li>
                    <li>Vá em <strong>SQL Editor</strong>, cole o código abaixo e clique em "Run" para criar as tabelas.</li>
                </ol>

                <div className="relative mt-2">
                    <div className="bg-gray-800 text-gray-300 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-40">
                        <pre>{sqlCode}</pre>
                    </div>
                    <button 
                        onClick={handleCopySql}
                        className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                        title="Copiar SQL"
                    >
                        <Copy size={14} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 italic">
                    Nota: O comando SQL acima cria tabelas e libera acesso público para facilitar o uso. Em um ambiente real, configure as políticas de segurança (RLS) conforme necessário.
                </p>
            </div>
        </div>
    </div>
  );
};