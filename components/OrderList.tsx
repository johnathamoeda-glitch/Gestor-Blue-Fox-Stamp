import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { Edit2, Trash2, MessageSquare, AlertTriangle, CheckCircle, FileText, Search, CalendarClock, Calendar } from 'lucide-react';
import { MessageGenerator } from './MessageGenerator';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onEdit, onDelete }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState<Order | null>(null);

  // Extract available months from orders
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      // Format: "YYYY-MM"
      months.add(`${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`);
    });
    // Sort descending
    return Array.from(months).sort().reverse();
  }, [orders]);

  const formatMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(order.createdAt);
        matchesDate = date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month);
    }

    return matchesStatus && matchesSearch && matchesDate;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.READY: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                type="text"
                placeholder="Buscar por cliente ou descrição..."
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

             {/* Date Filter */}
             <div className="relative w-full md:w-64">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 appearance-none bg-white cursor-pointer capitalize"
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

        {/* Status Filter */}
        <div className="flex gap-2 w-full overflow-x-auto pb-2 md:pb-0 border-t border-gray-50 pt-2 no-scrollbar">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {Object.values(OrderStatus).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Nenhum pedido encontrado com os filtros atuais.</p>
            </div>
        ) : (
            filteredOrders.map(order => {
            const pendingAmount = order.totalValue - order.paidValue;
            const isLate = order.deliveryDate < Date.now() && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;
            const isUnpaid = pendingAmount > 0.01; // tolerance
            const paymentOverdue = isUnpaid && order.remainingPaymentDate && order.remainingPaymentDate < Date.now();

            return (
                <div key={order.id} className={`bg-white rounded-xl shadow-sm border p-5 transition-all hover:shadow-md ${isUnpaid && (order.status === OrderStatus.DELIVERED || paymentOverdue) ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}`}>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{order.customerName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status}
                            </span>
                             {isLate && (
                                <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    <AlertTriangle size={12} className="mr-1" /> Atrasado
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{order.description}</p>
                        <p className="text-gray-400 text-xs mt-1 truncate">{order.itemsDetails}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                             <span className="flex items-center gap-1">
                                <FileText size={14} className={order.notaFiscalIssued ? "text-green-500" : "text-orange-500"} />
                                {order.notaFiscalIssued ? "NF Emitida" : "NF Pendente"}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarClock size={14} />
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="flex flex-row lg:flex-col justify-between items-end gap-4 lg:gap-1 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 min-w-[140px]">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                            <p className="font-bold text-gray-900">R$ {order.totalValue.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Restante</p>
                            <p className={`font-bold ${isUnpaid ? 'text-red-600' : 'text-green-600'}`}>
                                R$ {pendingAmount.toFixed(2)}
                            </p>
                            {isUnpaid && order.remainingPaymentDate && (
                                <p className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${paymentOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                    <CalendarClock size={10} />
                                    {new Date(order.remainingPaymentDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                        <button 
                            onClick={() => setSelectedOrderForMessage(order)}
                            title="Gerar cobrança IA"
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2 lg:w-10 lg:h-10"
                        >
                             <MessageSquare size={18} />
                             <span className="lg:hidden text-sm font-medium">Cobrar</span>
                        </button>
                        <button 
                            onClick={() => onEdit(order)}
                            title="Editar"
                            className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 lg:w-10 lg:h-10"
                        >
                            <Edit2 size={18} />
                            <span className="lg:hidden text-sm font-medium">Editar</span>
                        </button>
                        <button 
                            onClick={() => {
                                if(window.confirm('Tem certeza que deseja excluir este pedido?')) onDelete(order.id);
                            }}
                            title="Excluir"
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 lg:w-10 lg:h-10"
                        >
                            <Trash2 size={18} />
                             <span className="lg:hidden text-sm font-medium">Excluir</span>
                        </button>
                    </div>
                </div>
                </div>
            );
            })
        )}
      </div>

      {selectedOrderForMessage && (
        <MessageGenerator 
            order={selectedOrderForMessage} 
            onClose={() => setSelectedOrderForMessage(null)} 
        />
      )}
    </div>
  );
};
