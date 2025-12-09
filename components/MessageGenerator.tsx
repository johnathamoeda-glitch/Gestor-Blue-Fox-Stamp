import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { MessageSquare, Copy, Check, X } from 'lucide-react';

interface MessageGeneratorProps {
  order: Order;
  onClose: () => void;
}

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({ order, onClose }) => {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Template-based message generation
    const generateMessage = () => {
      const remaining = order.totalValue - order.paidValue;
      const firstName = order.customerName.split(' ')[0];
      
      let msg = `Olá ${firstName}, tudo bem? Aqui é da Gestor Blue Fox Stamp. 🦊\n\n`;
      msg += `Estou passando referente ao seu pedido: *${order.description}*.\n`;
      
      // Status specific context
      if (order.status === OrderStatus.READY) {
         msg += `✅ *Seu pedido está pronto!* Pode vir retirar quando quiser.\n`;
      } else if (order.status === OrderStatus.DELIVERED) {
         msg += `🚀 Esperamos que tenha gostado do material entregue!\n`;
      } else if (order.status === OrderStatus.IN_PROGRESS) {
         msg += `⚙️ Seu pedido está em produção.\n`;
      }

      // Financial context
      if (remaining > 0.01) {
        msg += `\nLembramos que consta um saldo pendente de *R$ ${remaining.toFixed(2)}*.`;
        
        if (order.remainingPaymentDate) {
            const date = new Date(order.remainingPaymentDate).toLocaleDateString('pt-BR');
            msg += `\n📅 A data combinada para o acerto foi: ${date}.`;
        }
        
        msg += `\nPodemos confirmar o pagamento?`;
      } else {
         if (order.status === OrderStatus.READY) {
             msg += `\nO pagamento já está quitado. É só buscar!`;
         }
      }
      
      msg += `\n\nQualquer dúvida estou à disposição!`;
      return msg;
    };

    setGeneratedText(generateMessage());
  }, [order]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
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
            Gerador de Mensagem
          </h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Mensagem gerada para {order.customerName}:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] relative">
                <textarea 
                  className="w-full h-40 bg-transparent border-none focus:ring-0 text-sm text-gray-700 resize-none p-0 focus:outline-none"
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleWhatsAppRedirect}
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