import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { Save, X, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';

interface OrderFormProps {
  existingOrder?: Order;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ existingOrder, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Order>>({
    status: OrderStatus.PENDING,
    notaFiscalIssued: false,
    paidValue: 0,
    totalValue: 0,
    createdAt: Date.now(),
    deliveryDate: Date.now() + 86400000 * 3, // Default 3 days ahead
    remainingPaymentDate: undefined,
  });

  useEffect(() => {
    if (existingOrder) {
      setFormData(existingOrder);
    }
  }, [existingOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderToSave = {
      ...formData,
      id: existingOrder?.id || crypto.randomUUID(),
    } as Order;
    onSave(orderToSave);
  };

  const pendingValue = (formData.totalValue || 0) - (formData.paidValue || 0);
  const hasPending = pendingValue > 0.01;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {existingOrder ? 'Editar Pedido' : 'Novo Pedido'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                required
                name="customerName"
                value={formData.customerName || ''}
                onChange={handleChange}
                type="text"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="Ex: João da Silva"
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
            <input
              required
              name="customerPhone"
              value={formData.customerPhone || ''}
              onChange={handleChange}
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {/* Order Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Resumida</label>
          <input
            required
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            placeholder="Ex: 20 Camisas Polo Bordadas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes Técnicos</label>
          <textarea
            name="itemsDetails"
            value={formData.itemsDetails || ''}
            onChange={handleChange}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            placeholder="Ex: 10 P, 10 M. Cor Azul Marinho. Logotipo no peito esquerdo."
          />
        </div>

        {/* Financials & Dates */}
        <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> Financeiro e Prazos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                <div className="relative">
                    <input
                    required
                    name="totalValue"
                    value={formData.totalValue}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago (R$)</label>
                <div className="relative">
                    <input
                        required
                        name="paidValue"
                        value={formData.paidValue}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pedido</label>
                <input
                required
                type="date"
                name="createdAt"
                value={new Date(formData.createdAt || Date.now()).toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, createdAt: new Date(e.target.value).getTime() }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                <input
                required
                type="date"
                name="deliveryDate"
                value={new Date(formData.deliveryDate || Date.now()).toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: new Date(e.target.value).getTime() }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>
            </div>

            {hasPending && (
                <div className="mt-4 pt-4 border-t border-indigo-200 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-800">
                            <AlertCircle size={20} />
                            <span className="text-sm font-medium">
                                Resta receber: <strong>R$ {pendingValue.toFixed(2)}</strong>
                            </span>
                        </div>
                        <div className="flex-1 w-full md:w-auto">
                            <label className="block text-xs font-medium text-orange-800 mb-1">
                                Data Combinada para Pagamento Restante
                            </label>
                            <input
                                type="date"
                                name="remainingPaymentDate"
                                value={formData.remainingPaymentDate ? new Date(formData.remainingPaymentDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    remainingPaymentDate: e.target.value ? new Date(e.target.value).getTime() : undefined 
                                }))}
                                className="block w-full rounded-md border-orange-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Status & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status do Pedido</label>
                <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                >
                    {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
                <input
                    id="notaFiscalIssued"
                    name="notaFiscalIssued"
                    type="checkbox"
                    checked={formData.notaFiscalIssued}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="notaFiscalIssued" className="font-medium text-gray-700 select-none cursor-pointer">
                    Nota Fiscal Emitida?
                </label>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
          >
            <Save size={16} />
            Salvar Pedido
          </button>
        </div>
      </form>
    </div>
  );
};