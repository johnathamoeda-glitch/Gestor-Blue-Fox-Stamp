import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ActivityPriority } from '../types';
import { getActivities, saveActivity, deleteActivity, toggleActivityCompletion } from '../services/storageService';
import { Plus, Trash2, Calendar, CheckSquare, Square, AlertCircle, MapPin, Scissors, ShoppingBag, Filter } from 'lucide-react';

export const ScheduledActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<ActivityPriority>('medium');

  useEffect(() => {
    refreshActivities();
  }, []);

  const refreshActivities = () => {
    const loaded = getActivities();
    // Sort: Incomplete first, then by date ASC, then by priority
    loaded.sort((a, b) => {
      if (a.completed === b.completed) {
        return a.date - b.date;
      }
      return a.completed ? 1 : -1;
    });
    setActivities(loaded);
  };

  // 1. Extract available months from activities
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    activities.forEach(act => {
      const d = new Date(act.date);
      // Format: "YYYY-MM"
      months.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`);
    });
    // Sort descending
    return Array.from(months).sort().reverse();
  }, [activities]);

  // 2. Filter activities based on selection
  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    if (selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-');
      filtered = activities.filter(act => {
        const d = new Date(act.date);
        return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month);
      });
    }
    
    return filtered;
  }, [activities, selectedMonth]);

  // 3. Helper for label
  const formatMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      title,
      description,
      date: new Date(date).getTime(),
      priority,
      completed: false
    };
    
    saveActivity(newActivity);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setIsFormOpen(false);
    refreshActivities();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      deleteActivity(id);
      refreshActivities();
    }
  };

  const handleToggle = (id: string) => {
    toggleActivityCompletion(id);
    refreshActivities();
  };

  const getPriorityColor = (p: ActivityPriority) => {
    switch(p) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPriorityLabel = (p: ActivityPriority) => {
    switch(p) {
        case 'high': return 'Alta Prioridade';
        case 'medium': return 'Média';
        case 'low': return 'Baixa';
      }
  }

  // Helper to suggest icons based on title keywords (just for fun visuals)
  const getActivityIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('malha') || t.includes('comprar')) return <ShoppingBag size={18} />;
    if (t.includes('viajar') || t.includes('viagem')) return <MapPin size={18} />;
    if (t.includes('costureira') || t.includes('costura')) return <Scissors size={18} />;
    return <Calendar size={18} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Atividades Agendadas
        </h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span className="">Nova Atividade</span>
        </button>
      </div>

       {/* Filter Section */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h2 className="text-gray-700 font-semibold flex items-center gap-2 text-sm">
            <Filter size={18} className="text-indigo-600" />
            Filtrar Período:
          </h2>
          <div className="relative w-full sm:w-64">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border appearance-none cursor-pointer hover:bg-white transition-colors capitalize"
              >
              <option value="all">Todo o Período</option>
              {availableMonths.map(monthStr => (
                  <option key={monthStr} value={monthStr}>
                  {formatMonthLabel(monthStr)}
                  </option>
              ))}
              </select>
          </div>
      </div>

      {/* Form Area */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 animate-fade-in-up">
            <h3 className="font-semibold text-gray-700 mb-4">Agendar Nova Atividade</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">O que fazer?</label>
                        <input 
                            required
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Comprar malha na capital"
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input 
                            required
                            type="date" 
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes (Opcional)</label>
                         <input 
                            type="text" 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ex: Levar dinheiro em espécie para desconto"
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                        <select 
                            value={priority}
                            onChange={e => setPriority(e.target.value as ActivityPriority)}
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta (Urgente)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Salvar Agendamento
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* List Area */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                    {selectedMonth === 'all' 
                        ? 'Nenhuma atividade agendada' 
                        : `Nenhuma atividade em ${formatMonthLabel(selectedMonth)}`}
                </h3>
                <p className="text-gray-500">Use o botão acima para adicionar lembretes de compras e viagens.</p>
            </div>
        ) : (
            filteredActivities.map(activity => {
                const isLate = !activity.completed && activity.date < new Date().setHours(0,0,0,0);
                
                return (
                    <div 
                        key={activity.id} 
                        className={`group bg-white rounded-xl p-4 border transition-all hover:shadow-md flex items-start gap-4 ${activity.completed ? 'opacity-60 border-gray-100 bg-gray-50' : 'border-gray-100'}`}
                    >
                        <button 
                            onClick={() => handleToggle(activity.id)}
                            className={`mt-1 flex-shrink-0 transition-colors ${activity.completed ? 'text-green-500' : 'text-gray-300 hover:text-indigo-500'}`}
                        >
                            {activity.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className={`font-semibold text-lg ${activity.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                    {activity.title}
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${getPriorityColor(activity.priority)}`}>
                                    {getPriorityLabel(activity.priority)}
                                </span>
                                {isLate && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                        <AlertCircle size={10} /> Atrasado
                                    </span>
                                )}
                            </div>
                            
                            {activity.description && (
                                <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(activity.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span className="hidden group-hover:inline-flex text-indigo-400 items-center gap-1">
                                    {getActivityIcon(activity.title)}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleDelete(activity.id)}
                            className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Excluir atividade"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};