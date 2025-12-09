import React, { useState, useRef } from 'react';
import { X, Lock, Save, User, Check, Download, Upload, AlertTriangle } from 'lucide-react';
import { updateUserPassword, exportAllData, importAllData } from '../services/storageService';

interface UserProfileProps {
  username: string;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 4) {
      setMessage({ text: 'A senha deve ter pelo menos 4 caracteres.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    const success = updateUserPassword(username, newPassword);
    
    if (success) {
      setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ text: 'Erro ao atualizar senha.', type: 'error' });
    }
  };

  const handleExport = () => {
    const dataStr = exportAllData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Backup_BlueFox_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage({ text: 'Backup baixado com sucesso! Envie este arquivo para o outro dispositivo.', type: 'info' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonContent = event.target?.result as string;
      if (confirm('ATENÇÃO: Isso irá substituir todos os dados atuais pelos dados do arquivo. Deseja continuar?')) {
        const success = importAllData(jsonContent);
        if (success) {
          alert('Dados restaurados com sucesso! O sistema será recarregado.');
          window.location.reload();
        } else {
          setMessage({ text: 'Erro ao ler o arquivo de backup.', type: 'error' });
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Perfil do Usuário</h2>
                    <p className="text-indigo-100 text-sm">{username}</p>
                </div>
            </div>
        </div>

        <div className="p-6 space-y-8">
            
            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 
                    message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                }`}>
                    {message.type === 'success' ? <Check size={16} /> : 
                     message.type === 'error' ? <X size={16} /> : <Download size={16} />}
                    {message.text}
                </div>
            )}

            {/* Change Password Section */}
            <form onSubmit={handleSavePassword} className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Lock size={18} className="text-indigo-500" />
                    Alterar Senha
                </h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                        placeholder="Digite a nova senha"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                        placeholder="Repita a nova senha"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    <Save size={16} />
                    Salvar Nova Senha
                </button>
            </form>

            {/* Backup Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Download size={18} className="text-green-600" />
                    Sincronizar Dados (Backup)
                </h3>
                
                <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800 flex gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <p>Como o sistema roda offline, use isso para transferir dados entre Computador e Celular.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center gap-2 px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-200 transition-all group"
                    >
                        <Download size={24} className="text-gray-400 group-hover:text-indigo-600" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-700">Baixar Dados</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleImportClick}
                        className="flex flex-col items-center justify-center gap-2 px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-200 transition-all group"
                    >
                        <Upload size={24} className="text-gray-400 group-hover:text-green-600" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">Restaurar Dados</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".json" 
                        onChange={handleFileChange} 
                    />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};