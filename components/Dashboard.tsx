import React, { useMemo, useState } from 'react';
import { Order, OrderStatus } from '../types';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Package, AlertCircle, TrendingUp, CheckCircle, Calendar, Filter, ClipboardList } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // 1. Extract available months from orders
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      // Format: "YYYY-MM" for sorting/filtering
      months.add(`${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`);
    });
    // Sort descending (newest first)
    return Array.from(months).sort().reverse();
  }, [orders]);

  // 2. Filter orders based on selection
  const filteredOrders = useMemo(() => {
    if (selectedMonth === 'all') return orders;
    
    const [year, month] = selectedMonth.split('-');
    return orders.filter(order => {
      const date = new Date(order.createdAt);
      return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month);
    });
  }, [orders, selectedMonth]);

  // 3. Helper to format label (e.g., "2023-10" -> "Outubro 2023")
  const formatMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // 4. Calculate stats based on FILTERED orders
  const stats = useMemo(() => {
    const totalValue = filteredOrders.reduce((acc, o) => acc + o.totalValue, 0);
    const receivedValue = filteredOrders.reduce((acc, o) => acc + o.paidValue, 0);
    const pendingValue = totalValue - receivedValue;
    const activeOrders = filteredOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length;
    const readyPickup = filteredOrders.filter(o => o.status === OrderStatus.READY).length;
    const missingNF = filteredOrders.filter(o => !o.notaFiscalIssued && o.status !== OrderStatus.CANCELLED).length;
    const totalOrders = filteredOrders.length;

    return { totalValue, receivedValue, pendingValue, activeOrders, readyPickup, missingNF, totalOrders };
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    const counts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const financialData = [
    { name: 'Recebido', value: stats.receivedValue },
    { name: 'A Receber', value: stats.pendingValue },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
        <h2 className="text-gray-700 font-semibold flex items-center gap-2">
          <Filter size={20} className="text-indigo-600" />
          Filtro de Período
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border appearance-none cursor-pointer hover:bg-white transition-colors capitalize"
          >
            <option value="all">Todo o Período (Geral)</option>
            {availableMonths.map(monthStr => (
              <option key={monthStr} value={monthStr}>
                {formatMonthLabel(monthStr)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturamento</p>
            <h3 className="text-2xl font-bold text-indigo-600">R$ {stats.totalValue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Received */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Recebido</p>
            <h3 className="text-2xl font-bold text-green-600">R$ {stats.receivedValue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">A Receber</p>
            <h3 className="text-2xl font-bold text-red-500">R$ {stats.pendingValue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-500">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            <span className="text-xs text-gray-400">Independente da fase</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <ClipboardList size={24} />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pedidos Ativos</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.activeOrders}</h3>
            {stats.readyPickup > 0 && <span className="text-xs text-green-600 font-medium">{stats.readyPickup} prontos p/ entrega</span>}
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Package size={24} />
          </div>
        </div>

        {/* Missing NF */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Sem Nota Fiscal</p>
            <h3 className="text-2xl font-bold text-orange-500">{stats.missingNF}</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-full text-orange-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Status dos Pedidos {selectedMonth !== 'all' && `(${formatMonthLabel(selectedMonth)})`}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Sem dados para este período
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Fluxo Financeiro {selectedMonth !== 'all' && `(${formatMonthLabel(selectedMonth)})`}</h4>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               {filteredOrders.length > 0 ? (
                <BarChart data={financialData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                      {
                          financialData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                          ))
                      }
                  </Bar>
                </BarChart>
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-400">
                   Sem movimentação neste período
                 </div>
               )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};