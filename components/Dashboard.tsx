import React, { useMemo, useState } from 'react';
import { Order, OrderStatus } from '../types';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DollarSign, Package, AlertCircle, TrendingUp, CheckCircle, ClipboardList } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { FilterType, filterListByDate, getPeriodLabel } from '../services/dateUtils';

interface DashboardProps {
  orders: Order[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  // Filter orders based on advanced selection
  const filteredOrders = useMemo(() => {
    return filterListByDate(orders, 'createdAt', filterType, filterValue);
  }, [orders, filterType, filterValue]);

  // Calculate stats based on FILTERED orders
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

  const periodLabel = useMemo(() => getPeriodLabel(filterType, filterValue), [filterType, filterValue]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Period Filter */}
      <PeriodFilter 
        filterType={filterType} 
        filterValue={filterValue} 
        onFilterChange={(t, v) => { setFilterType(t); setFilterValue(v); }} 
      />

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
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Status dos Pedidos {periodLabel && `(${periodLabel})`}</h4>
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
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Fluxo Financeiro {periodLabel && `(${periodLabel})`}</h4>
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