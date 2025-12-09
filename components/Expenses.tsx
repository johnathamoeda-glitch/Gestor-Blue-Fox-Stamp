
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { getExpenses, saveExpense, deleteExpense } from '../services/storageService';
import { PeriodFilter } from './PeriodFilter';
import { FilterType, filterListByDate, getPeriodLabel } from '../services/dateUtils';
import { Plus, Trash2, DollarSign, ShoppingBag, Home, Wrench, MoreHorizontal, Wallet, User, Users, Printer } from 'lucide-react';

interface ExpensesProps {
  currentUser: string;
}

const CATEGORIES: ExpenseCategory[] = ['Material', 'Funcionário', 'Maquinário', 'Aluguel', 'Manutenção', 'Outros'];

export const Expenses: React.FC<ExpensesProps> = ({ currentUser }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter State
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  // Form State
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Material');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    refreshExpenses();
  }, []);

  const refreshExpenses = () => {
    const loaded = getExpenses();
    // Sort by date DESC
    loaded.sort((a, b) => b.date - a.date);
    setExpenses(loaded);
  };

  const filteredExpenses = useMemo(() => {
    return filterListByDate(expenses, 'date', filterType, filterValue);
  }, [expenses, filterType, filterValue]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);
  }, [filteredExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      value: parseFloat(value),
      category,
      date: new Date(date).getTime(),
      createdBy: currentUser
    };

    saveExpense(newExpense);
    
    // Reset
    setDescription('');
    setValue('');
    setCategory('Material');
    setIsFormOpen(false);
    refreshExpenses();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar esta despesa?')) {
      deleteExpense(id);
      refreshExpenses();
    }
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch(cat) {
      case 'Material': return <ShoppingBag size={18} className="text-blue-500" />;
      case 'Funcionário': return <Users size={18} className="text-green-500" />;
      case 'Maquinário': return <Printer size={18} className="text-orange-500" />;
      case 'Aluguel': return <Home size={18} className="text-purple-500" />;
      case 'Manutenção': return <Wrench size={18} className="text-gray-500" />;
      default: return <MoreHorizontal size={18} className="text-indigo-500" />;
    }
  };

  const periodLabel = useMemo(() => getPeriodLabel(filterType, filterValue), [filterType, filterValue]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Wallet className="text-red-500" />
             Controle de Gastos
           </h2>
           <p className="text-gray-500 text-sm">Registre as saídas e despesas do dia a dia.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm w-full md:w-auto justify-center font-medium"
        >
          <Plus size={20} />
          {isFormOpen ? 'Fechar Formulário' : 'Nova Despesa'}
        </button>
      </div>

      <PeriodFilter 
        filterType={filterType} 
        filterValue={filterValue} 
        onFilterChange={(t, v) => { setFilterType(t); setFilterValue(v); }} 
      />

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
          <div>
              <p className="text-sm font-medium text-red-600 mb-1">Total de Gastos ({periodLabel || 'Geral'})</p>
              <h3 className="text-3xl font-bold text-red-700">R$ {totalExpenses.toFixed(2)}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600">
              <DollarSign size={24} />
          </div>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 animate-fade-in-up">
           <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Adicionar Novo Gasto</h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="lg:col-span-2">
                   <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                   <input 
                      required
                      type="text" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ex: Pagamento semanal, Manutenção da plotter..."
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-red-500 focus:border-red-500"
                   />
               </div>
               <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
                   <input 
                      required
                      type="number" 
                      step="0.01"
                      min="0"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-red-500 focus:border-red-500"
                   />
               </div>
               <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                   <select 
                      value={category}
                      onChange={e => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-red-500 focus:border-red-500 bg-white"
                   >
                       {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
               </div>
               <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                   <input 
                      required
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-red-500 focus:border-red-500"
                   />
               </div>
               <div className="lg:col-span-3 flex items-end justify-end">
                   <button type="submit" className="w-full md:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                       Salvar Gasto
                   </button>
               </div>
           </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredExpenses.length === 0 ? (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                  Nenhum gasto registrado neste período.
                              </td>
                          </tr>
                      ) : (
                          filteredExpenses.map(expense => (
                              <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                                      {expense.createdBy && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                <User size={10} /> {expense.createdBy}
                                            </span>
                                        </div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                          {getCategoryIcon(expense.category)}
                                          {expense.category}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">
                                      - R$ {expense.value.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button 
                                        onClick={() => handleDelete(expense.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};