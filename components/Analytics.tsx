import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity as ActivityIcon, TrendingUp, DollarSign, Target, PieChart as PieChartIcon } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { FilterType, filterListByDate, getPeriodLabel } from '../services/dateUtils';

interface AnalyticsProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.PENDING]: '#FBBF24', // Amber
  [OrderStatus.IN_PROGRESS]: '#60A5FA', // Blue
  [OrderStatus.READY]: '#A78BFA', // Purple
  [OrderStatus.DELIVERED]: '#34D399', // Emerald
  [OrderStatus.CANCELLED]: '#9CA3AF', // Gray
};

export const Analytics: React.FC<AnalyticsProps> = ({ orders }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  // 1. Filter orders
  const filteredOrders = useMemo(() => {
    return filterListByDate(orders, 'createdAt', filterType, filterValue);
  }, [orders, filterType, filterValue]);

  // 2. KPI Calculations
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalValue, 0);
    const totalReceived = filteredOrders.reduce((acc, o) => acc + o.paidValue, 0);
    const totalPending = totalRevenue - totalReceived;
    const orderCount = filteredOrders.length;
    const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
    
    // Receipt Rate (How much of the total value was actually paid)
    const receiptRate = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0;

    return { totalRevenue, totalReceived, totalPending, avgTicket, receiptRate, orderCount };
  }, [filteredOrders]);

  // 3. Data for Timeline Chart (Financial Evolution)
  const timelineData = useMemo(() => {
    const dataMap = new Map<string, { date: string, recebido: number, pendente: number, sortKey: number }>();

    filteredOrders.forEach(order => {
      const d = new Date(order.createdAt);
      let key = '';
      let sortKey = d.getTime();

      // Dynamic Grouping based on Filter Level
      if (filterType === 'all' || filterType === 'year') {
        // Group by Month (YYYY-MM)
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      } else {
         // Group by Day (DD/MM)
         key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
         sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      }

      const current = dataMap.get(key) || { date: key, recebido: 0, pendente: 0, sortKey };
      
      current.recebido += order.paidValue;
      current.pendente += (order.totalValue - order.paidValue);
      dataMap.set(key, current);
    });

    // Convert map to array and sort
    return Array.from(dataMap.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredOrders, filterType]);

  // 4. Data for Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
        name, 
        value,
        fill: STATUS_COLORS[name] || '#8884d8'
    }));
  }, [filteredOrders]);

  const periodLabel = useMemo(() => getPeriodLabel(filterType, filterValue), [filterType, filterValue]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ActivityIcon className="text-indigo-600" />
                Relatórios Detalhados
            </h2>
            <p className="text-sm text-gray-500">Análise profunda de faturamento e produção</p>
        </div>
      </div>

      <PeriodFilter 
        filterType={filterType} 
        filterValue={filterValue} 
        onFilterChange={(t, v) => { setFilterType(t); setFilterValue(v); }} 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Target size={18} />
                <span className="text-sm font-medium">Ticket Médio</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">R$ {kpis.avgTicket.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Valor médio por pedido</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-green-600">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Total Recebido</span>
            </div>
            <p className="text-2xl font-bold text-green-600">R$ {kpis.totalReceived.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{kpis.receiptRate.toFixed(1)}% do total contratado</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-red-500">
                <ActivityIcon size={18} />
                <span className="text-sm font-medium">Pendente de Recebimento</span>
            </div>
            <p className="text-2xl font-bold text-red-500">R$ {kpis.totalPending.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Dinheiro na rua</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-indigo-500">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">Volume de Pedidos</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{kpis.orderCount}</p>
            <p className="text-xs text-gray-400 mt-1">Neste período</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Financial Timeline (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução Financeira: Recebido vs Pendente</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `R$${val}`} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="recebido" stackId="a" fill="#10b981" name="Recebido" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="pendente" stackId="a" fill="#ef4444" name="Pendente" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
                {(filterType === 'all' || filterType === 'year') ? 'Agrupado por Mês (Ano-Mês)' : 'Agrupado por Dia (Dia/Mês)'}
            </p>
        </div>

        {/* Status Distribution (1/3 width) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fase dos Pedidos</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}} layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Summary Text */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <PieChartIcon size={20} /> Resumo do Período
          </h4>
          <p className="text-indigo-800 text-sm leading-relaxed">
              No período selecionado ({periodLabel || 'Todo o Histórico'}), 
              sua estamparia processou <strong>{kpis.orderCount} pedidos</strong>. 
              O faturamento total foi de <strong>R$ {kpis.totalRevenue.toFixed(2)}</strong>, sendo que 
              já foram recebidos <strong>R$ {kpis.totalReceived.toFixed(2)} ({kpis.receiptRate.toFixed(1)}%)</strong>.
              Você ainda tem <strong>R$ {kpis.totalPending.toFixed(2)}</strong> para receber de pedidos entregues ou em andamento.
              O valor médio de cada venda (Ticket Médio) está em <strong>R$ {kpis.avgTicket.toFixed(2)}</strong>.
          </p>
      </div>

    </div>
  );
};