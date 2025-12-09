import React, { useState } from 'react';
import { X, Lock, Save, User, Check } from 'lucide-react';
import { updateUserPassword } from '../services/storageService';

interface UserProfileProps {
  username: string;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = (e: React.FormEvent) => {
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
      // Optional: Close after delay
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage({ text: 'Erro ao atualizar senha.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        
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

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
            
            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                        placeholder="Digite a nova senha"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                        placeholder="Repita a nova senha"
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    <Save size={16} />
                    Salvar Alterações
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};