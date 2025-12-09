import React, { useState } from 'react';
import { Order } from '../types';
import { generatePaymentReminder } from '../services/geminiService';
import { MessageSquare, Copy, Check, X } from 'lucide-react';

interface MessageGeneratorProps {
  order: Order;
  onClose: () => void;
}

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({ order, onClose }) => {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      const text = await generatePaymentReminder(order);
      setGeneratedText(text);
      setIsLoading(false);
    };
    fetchMessage();
  }, [order]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
    // Basic format for cleaning phone number
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(generatedText);
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare size={18} />
            Assistente de Cobrança IA
          </h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Mensagem sugerida para {order.customerName}:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-indigo-500 gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  Gerando mensagem...
                </div>
              ) : (
                <textarea 
                  className="w-full h-32 bg-transparent border-none focus:ring-0 text-sm text-gray-700 resize-none p-0"
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleWhatsAppRedirect}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm shadow-sm"
            >
              <MessageSquare size={16} />
              Enviar Zap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};