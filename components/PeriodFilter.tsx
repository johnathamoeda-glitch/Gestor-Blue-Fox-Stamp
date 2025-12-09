import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { FilterType } from '../services/dateUtils';

interface PeriodFilterProps {
  filterType: FilterType;
  filterValue: string;
  onFilterChange: (type: FilterType, value: string) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ filterType, filterValue, onFilterChange }) => {
  // Estado local para controlar a data de referência da navegação
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Atualiza o estado interno se o tipo mudar
  useEffect(() => {
    if (filterType !== 'all' && !filterValue) {
      updateFilter(filterType, new Date());
    } else if (filterValue) {
        // Tenta sincronizar a data interna com o valor vindo de fora (se houver persistência)
        try {
            if(filterType === 'day') setCurrentDate(new Date(filterValue + 'T00:00:00'));
            if(filterType === 'month') setCurrentDate(new Date(filterValue + '-01T00:00:00'));
            if(filterType === 'year') setCurrentDate(new Date(parseInt(filterValue), 0, 1));
            // Week é mais complexo reverter string para data, deixamos o fluxo natural
        } catch(e) {
            // ignore
        }
    }
  }, [filterType]);

  const updateFilter = (type: FilterType, date: Date) => {
    setCurrentDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let newValue = '';

    if (type === 'year') newValue = String(year);
    if (type === 'month') newValue = `${year}-${month}`;
    if (type === 'day') newValue = `${year}-${month}-${day}`;
    if (type === 'week') {
      // Cálculo da semana ISO para gerar string YYYY-Www
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      newValue = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }

    onFilterChange(type, newValue);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const amount = direction === 'next' ? 1 : -1;

    if (filterType === 'day') newDate.setDate(newDate.getDate() + amount);
    if (filterType === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
    if (filterType === 'month') newDate.setMonth(newDate.getMonth() + amount);
    if (filterType === 'year') newDate.setFullYear(newDate.getFullYear() + amount);

    updateFilter(filterType, newDate);
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;

      onFilterChange(filterType, val);

      // Precisamos atualizar o currentDate baseado na seleção manual
      // para que as setas < > continuem funcionando a partir da nova data
      if (filterType === 'day') {
          setCurrentDate(new Date(val + 'T00:00:00'));
      } else if (filterType === 'month') {
          setCurrentDate(new Date(val + '-01T00:00:00'));
      } else if (filterType === 'year') {
          setCurrentDate(new Date(parseInt(val), 0, 1));
      } else if (filterType === 'week') {
          // week input retorna "2023-W42"
          const [y, w] = val.split('-W');
          const simpleDate = new Date(parseInt(y), 0, 1 + (parseInt(w) - 1) * 7);
          setCurrentDate(simpleDate);
      }
  };

  const handleTypeChange = (type: FilterType) => {
    if (type === 'all') {
      onFilterChange('all', '');
    } else {
      updateFilter(type, new Date()); // Reseta para hoje ao mudar o tipo
    }
  };

  const tabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Geral' },
    { id: 'year', label: 'Ano' },
    { id: 'month', label: 'Mês' },
    { id: 'week', label: 'Semana' },
    { id: 'day', label: 'Dia' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      
      {/* 1. Tabs de Seleção de Tipo */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTypeChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Área de Navegação (Escondida se for 'Geral') */}
      {filterType !== 'all' && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 gap-2">
            
            {/* Controles Esquerda */}
            <button 
                onClick={() => handleNavigate('prev')}
                className="p-2 hover:bg-white rounded-full transition-colors text-indigo-600 border border-transparent hover:border-indigo-100 shadow-sm"
                title="Anterior"
            >
                <ChevronLeft size={24} />
            </button>

            {/* INPUT MANUAL CENTRALIZADO */}
            <div className="flex-1 w-full sm:max-w-xs text-center">
                {filterType === 'year' && (
                    <input 
                        type="number" 
                        value={filterValue} 
                        onChange={handleManualChange}
                        className="w-full text-center p-2 rounded-lg border-indigo-200 focus:ring-indigo-500 font-bold text-indigo-900 bg-white shadow-inner"
                    />
                )}
                {filterType === 'month' && (
                    <input 
                        type="month" 
                        value={filterValue}
                        onChange={handleManualChange}
                        className="w-full text-center p-2 rounded-lg border-indigo-200 focus:ring-indigo-500 font-bold text-indigo-900 bg-white shadow-inner"
                    />
                )}
                {filterType === 'week' && (
                    <input 
                        type="week" 
                        value={filterValue}
                        onChange={handleManualChange}
                        className="w-full text-center p-2 rounded-lg border-indigo-200 focus:ring-indigo-500 font-bold text-indigo-900 bg-white shadow-inner cursor-pointer"
                    />
                )}
                {filterType === 'day' && (
                    <input 
                        type="date" 
                        value={filterValue}
                        onChange={handleManualChange}
                        className="w-full text-center p-2 rounded-lg border-indigo-200 focus:ring-indigo-500 font-bold text-indigo-900 bg-white shadow-inner"
                    />
                )}
            </div>

            {/* Controles Direita */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => updateFilter(filterType, new Date())}
                    className="text-xs font-bold text-indigo-600 px-3 py-1.5 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors uppercase tracking-wide whitespace-nowrap"
                >
                    Hoje
                </button>
                <button 
                    onClick={() => handleNavigate('next')}
                    className="p-2 hover:bg-white rounded-full transition-colors text-indigo-600 border border-transparent hover:border-indigo-100 shadow-sm"
                    title="Próximo"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      )}

       {/* Feedback visual para 'Geral' */}
       {filterType === 'all' && (
           <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 text-sm italic">
               <Filter size={16} className="mr-2" />
               Visualizando todos os registros sem filtro de data.
           </div>
       )}
    </div>
  );
};
