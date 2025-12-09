import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageType } from '../types';
import { getChatMessages, saveChatMessage, deleteChatMessage, generateId } from '../services/storageService';
import { Send, Mic, Image as ImageIcon, Paperclip, MoreVertical, Trash2, Edit2, X, Play, Pause, FileVideo, User } from 'lucide-react';

interface ChatProps {
  currentUser: string;
}

export const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // Polling for new messages (simulate real-time)
  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const refreshMessages = () => {
    const msgs = getChatMessages();
    // Sort by timestamp
    msgs.sort((a, b) => a.timestamp - b.timestamp);
    
    // Only update if length changed or last message different (simple check)
    setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(msgs)) {
            return msgs;
        }
        return prev;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (type: MessageType = 'text', content: string = inputValue) => {
    if (!content.trim()) return;

    if (editingMessageId) {
        // Edit Mode
        const msg = messages.find(m => m.id === editingMessageId);
        if (msg) {
            const updatedMsg = { ...msg, content, edited: true };
            saveChatMessage(updatedMsg);
            setEditingMessageId(null);
            setInputValue('');
        }
    } else {
        // New Message
        const newMessage: ChatMessage = {
            id: generateId(),
            sender: currentUser,
            content,
            type,
            timestamp: Date.now(),
            edited: false
        };
        saveChatMessage(newMessage);
        setInputValue('');
    }
    refreshMessages();
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Apagar esta mensagem?')) {
        deleteChatMessage(id);
        refreshMessages();
    }
  };

  const startEditMessage = (msg: ChatMessage) => {
      if (msg.type === 'text') {
          setInputValue(msg.content);
          setEditingMessageId(msg.id);
      } else {
          alert('Apenas mensagens de texto podem ser editadas.');
      }
  };

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          handleSendMessage('audio', base64data);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop stream
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setMediaRecorder(null);
  };

  // --- File Upload Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to ~1.5MB to avoid LocalStorage crash
    if (file.size > 1.5 * 1024 * 1024) {
        alert("Arquivo muito grande! Para este sistema, o limite é 1.5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target?.result as string;
        let type: MessageType = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        if (file.type.startsWith('audio/')) type = 'audio';
        
        handleSendMessage(type, base64);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-[#e5ddd5] rounded-xl overflow-hidden shadow-xl border border-gray-200 relative">
      
      {/* Chat Header */}
      <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md z-10">
         <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-full">
                 <User size={24} />
             </div>
             <div>
                 <h2 className="font-bold text-lg">Equipe Blue Fox Stamp</h2>
                 <p className="text-xs text-white/80">Grupo da Empresa</p>
             </div>
         </div>
         <div className="text-xs bg-white/10 px-2 py-1 rounded">
             Você é: <strong>{currentUser}</strong>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
         {messages.length === 0 && (
             <div className="text-center bg-white/90 p-4 rounded-lg shadow-sm max-w-xs mx-auto mt-10">
                 <p className="text-gray-600 text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
             </div>
         )}
         
         {messages.map((msg) => {
             const isMe = msg.sender === currentUser;
             
             return (
                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`relative max-w-[85%] md:max-w-[60%] rounded-lg p-3 shadow-sm ${
                         isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                     }`}>
                         {/* Sender Name (if not me) */}
                         {!isMe && (
                             <p className="text-xs font-bold text-orange-600 mb-1">{msg.sender}</p>
                         )}

                         {/* Content Render */}
                         <div className="mb-1 text-gray-800 break-words">
                             {msg.type === 'text' && <p className="whitespace-pre-wrap">{msg.content}</p>}
                             
                             {msg.type === 'image' && (
                                 <img src={msg.content} alt="Enviado" className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-95" />
                             )}
                             
                             {msg.type === 'video' && (
                                 <video controls src={msg.content} className="rounded-lg max-h-60 w-full" />
                             )}

                             {msg.type === 'audio' && (
                                 <audio controls src={msg.content} className="w-full min-w-[200px]" />
                             )}
                         </div>

                         {/* Metadata */}
                         <div className="flex items-center justify-end gap-1 mt-1">
                             {msg.edited && <span className="text-[10px] text-gray-500 italic">editado</span>}
                             <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                         </div>

                         {/* Actions (Only for Me) */}
                         {isMe && (
                             <div className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/10 to-transparent rounded-tr-lg">
                                 <div className="flex gap-1 bg-white shadow-sm rounded-md p-1">
                                    {msg.type === 'text' && (
                                        <button onClick={() => startEditMessage(msg)} className="text-gray-500 hover:text-blue-600">
                                            <Edit2 size={12} />
                                        </button>
                                    )}
                                     <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-500 hover:text-red-600">
                                         <Trash2 size={12} />
                                     </button>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
             );
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-3 flex items-end gap-2 border-t border-gray-200">
          
          {/* Actions Left */}
          <div className="flex gap-2 pb-2">
              <input 
                 type="file" 
                 accept="image/*,video/*,audio/*" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                title="Anexar arquivo"
              >
                  <Paperclip size={24} />
              </button>
          </div>

          {/* Text Input or Recording UI */}
          <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2 shadow-sm border border-gray-100 min-h-[45px]">
              {isRecording ? (
                  <div className="flex items-center gap-3 w-full text-red-500 animate-pulse">
                      <Mic size={20} className="fill-current" />
                      <span className="font-medium">Gravando... {formatDuration(recordingTime)}</span>
                  </div>
              ) : (
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage('text');
                        }
                    }}
                    placeholder="Digite uma mensagem"
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-700 resize-none max-h-24 overflow-y-auto p-0"
                    rows={1}
                />
              )}
          </div>

          {/* Send / Mic Button */}
          <div className="pb-1">
            {inputValue.trim() || editingMessageId ? (
                <button 
                    onClick={() => handleSendMessage('text')}
                    className="bg-[#075e54] text-white p-3 rounded-full hover:bg-[#128c7e] transition-colors shadow-md"
                >
                    <Send size={20} />
                </button>
            ) : (
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-full transition-colors shadow-md ${
                        isRecording 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-[#075e54] text-white hover:bg-[#128c7e]'
                    }`}
                >
                    {isRecording ? <X size={20} /> : <Mic size={20} />}
                </button>
            )}
          </div>

          {editingMessageId && (
              <button 
                onClick={() => { setEditingMessageId(null); setInputValue(''); }}
                className="absolute top-[-40px] left-0 right-0 bg-yellow-50 p-2 text-xs flex justify-between items-center px-4 border-t border-yellow-200 text-yellow-800"
              >
                  <span>Editando mensagem...</span>
                  <X size={14} className="cursor-pointer" />
              </button>
          )}

      </div>
    </div>
  );
};