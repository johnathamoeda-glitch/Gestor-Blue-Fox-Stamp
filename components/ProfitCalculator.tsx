import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Scissors, Palette, ShoppingBag, Calculator, RefreshCw, TrendingUp, AlertTriangle, Search, User, Package, ArrowRight, X, ChevronDown } from 'lucide-react';
import { Order } from '../types';

interface ProfitCalculatorProps {
    orders: Order[];
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ orders }) => {
  // Inputs
  const [salePrice, setSalePrice] = useState<string>('');
  const [costFabric, setCostFabric] = useState<string>('');
  const [costSewing, setCostSewing] = useState<string>('');
  const [costPrint, setCostPrint] = useState<string>('');
  const [costMisc, setCostMisc] = useState<string>('');
  
  // Autocomplete State
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Calculations
  const calculations = useMemo(() => {
    const revenue = parseFloat(salePrice) || 0;
    const fabric = parseFloat(costFabric) || 0;
    const sewing = parseFloat(costSewing) || 0;
    const print = parseFloat(costPrint) || 0;
    const misc = parseFloat(costMisc) || 0;

    const totalCost = fabric + sewing + print + misc;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, fabric, sewing, print, misc, totalCost, profit, margin };
  }, [salePrice, costFabric, costSewing, costPrint, costMisc]);

  // Fixed Colors Mapping
  const CHART_CONFIG = [
    { name: 'Malha', key: 'fabric', color: '#3B82F6' }, // Blue
    { name: 'Costura', key: 'sewing', color: '#8B5CF6' }, // Purple
    { name: 'Estampa', key: 'print', color: '#EC4899' }, // Pink
    { name: 'Outros', key: 'misc', color: '#F59E0B' }, // Amber
    { name: 'Lucro', key: 'profit', color: '#10B981' }, // Green
  ];

  const chartData = CHART_CONFIG.map(item => ({
    name: item.name,
    value: calculations[item.key as keyof typeof calculations],
    color: item.color
  })).filter(item => item.value > 0);

  const handleClear = () => {
    setSalePrice('');
    setCostFabric('');
    setCostSewing('');
    setCostPrint('');
    setCostMisc('');
    setSelectedOrderId('');
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setShowSuggestions(true);
      if (selectedOrderId) {
          setSelectedOrderId(''); // Clear selection if typing new search
      }
  };

  const handleSuggestionClick = (order: Order) => {
      setSearchTerm(order.customerName);
      setSelectedOrderId(order.id);
      setSalePrice(order.totalValue.toString());
      setShowSuggestions(false);
  };

  // Filter orders based on search term
  const filteredSuggestions = useMemo(() => {
      if (!searchTerm) return [];
      return orders
        .filter(o => o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.createdAt - a.createdAt) // Newest first
        .slice(0, 5); // Limit to 5 suggestions
  }, [searchTerm, orders]);

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [selectedOrderId, orders]);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Calculator size={24} />
            </div>
            Calculadora de Lucro
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-12">Simule custos e descubra a margem real de cada pedido.</p>
        </div>
        <button 
          onClick={handleClear}
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200"
        >
          <RefreshCw size={16} />
          Limpar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Data Entry (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Order Import Section (Autocomplete) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative">
             <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                 <Search size={16} className="text-gray-400" />
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Importar Dados</span>
             </div>
             
             <div className="p-6">
                <div className="mb-4 relative" ref={wrapperRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Cliente</label>
                    
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Digite o nome do cliente..."
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 pl-10 text-base bg-white"
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        {searchTerm && (
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedOrderId(''); }}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
                            {filteredSuggestions.length > 0 ? (
                                filteredSuggestions.map(order => (
                                    <button
                                        key={order.id}
                                        onClick={() => handleSuggestionClick(order)}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800 group-hover:text-indigo-700">{order.customerName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{order.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                R$ {order.totalValue.toFixed(2)}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    Nenhum pedido encontrado.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {selectedOrder && (
                    <div className="flex items-start gap-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl animate-fade-in">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 hidden sm:block">
                            <User size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-indigo-900">{selectedOrder.customerName}</p>
                            <p className="text-xs text-indigo-700 mt-0.5 flex items-center gap-1">
                                <Package size={12} />
                                {selectedOrder.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-indigo-500">
                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-100">
                                    Venda: R$ {selectedOrder.totalValue.toFixed(2)}
                                </span>
                                <ArrowRight size={12} />
                                <span>Valor preenchido abaixo</span>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </div>

          {/* Costs Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Composição de Custos</span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Sale Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Venda (Total)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-semibold text-lg">R$</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-0 text-2xl font-bold text-gray-800 transition-colors bg-gray-50 focus:bg-white placeholder-gray-300"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <ShoppingBag size={14} className="text-blue-500" />
                            Custo Malha
                        </label>
                        <input
                            type="number"
                            value={costFabric}
                            onChange={(e) => setCostFabric(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <Scissors size={14} className="text-purple-500" />
                            Custo Costura
                        </label>
                        <input
                            type="number"
                            value={costSewing}
                            onChange={(e) => setCostSewing(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2.5"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <Palette size={14} className="text-pink-500" />
                            Custo Estampa/Pintura
                        </label>
                        <input
                            type="number"
                            value={costPrint}
                            onChange={(e) => setCostPrint(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2.5"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            Outros (Frete, etc)
                        </label>
                        <input
                            type="number"
                            value={costMisc}
                            onChange={(e) => setCostMisc(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2.5"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Charts (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
            
            {/* Main Result Card */}
            <div className={`rounded-2xl shadow-lg border p-6 text-center transition-all ${
                calculations.profit >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white' 
                : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-600 text-white'
            }`}>
                <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Resultado Estimado</p>
                <h3 className="text-4xl font-black tracking-tight mb-2">
                    R$ {calculations.profit.toFixed(2)}
                </h3>
                <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-medium bg-white/20 py-1 px-3 rounded-full mx-auto w-max">
                     <TrendingUp size={16} />
                     Margem: {calculations.margin.toFixed(1)}%
                </div>
            </div>

            {/* Breakdown Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-gray-800 font-bold mb-6">Distribuição Visual</h3>
                
                <div className="h-64 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        {chartData.length > 0 ? (
                        <PieChart>
                            <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                        ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300">
                            <PieChartIcon size={48} className="opacity-20 mb-2" />
                            <p className="text-sm">Preencha os valores para visualizar</p>
                        </div>
                        )}
                    </ResponsiveContainer>
                    
                    {/* Center Text (Profit) if data exists */}
                    {chartData.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Lucro</span>
                                <p className={`text-lg font-bold ${calculations.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {Math.round(calculations.margin)}%
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-600 text-sm">Faturamento Total</span>
                        <span className="font-bold text-gray-800">R$ {calculations.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                        <span className="text-red-600 text-sm">Custo Total</span>
                        <span className="font-bold text-red-700">- R$ {calculations.totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// Helper Icon component needed just for the empty state placeholder
function PieChartIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
    )
}