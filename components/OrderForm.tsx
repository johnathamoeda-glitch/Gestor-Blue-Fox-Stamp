import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderType } from '../types';
import { Save, X, User, AlertCircle, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { generateId } from '../services/storageService';

interface OrderFormProps {
  existingOrder?: Order;
  initialOrderType?: OrderType;
  currentUser: string;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ existingOrder, initialOrderType = 'Casa', currentUser, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Order>>({
    orderType: initialOrderType,
    status: OrderStatus.PENDING,
    notaFiscalIssued: false,
    paidValue: 0,
    totalValue: 0,
    createdAt: Date.now(),
    deliveryDate: Date.now() + 86400000 * 3, // Default 3 days ahead
    remainingPaymentDate: undefined,
    createdBy: currentUser,
  });

  useEffect(() => {
    if (existingOrder) {
      setFormData(existingOrder);
    } else {
        // Ensure the type and creator is set correctly for new orders
        setFormData(prev => ({ 
            ...prev, 
            orderType: initialOrderType,
            createdBy: currentUser 
        }));
    }
  }, [existingOrder, initialOrderType, currentUser]);

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

  const handleMarkAsFullyPaid = () => {
    if (formData.totalValue) {
        setFormData(prev => ({
            ...prev,
            paidValue: prev.totalValue,
            remainingPaymentDate: undefined // Clear reminder if paid
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderToSave = {
      ...formData,
      // Fallback for older records if edited
      orderType: formData.orderType || 'Casa', 
      createdBy: formData.createdBy || currentUser, // Ensure creator exists
      id: existingOrder?.id || generateId(),
    } as Order;
    onSave(orderToSave);
  };

  const pendingValue = (formData.totalValue || 0) - (formData.paidValue || 0);
  const hasPending = pendingValue > 0.01;

  const isOutsourced = formData.orderType === 'Terceirizado';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${isOutsourced ? 'bg-orange-50' : 'bg-indigo-50'}`}>
        <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {existingOrder ? 'Editar Pedido' : 'Novo Pedido'}
            <span className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wide flex items-center gap-1 ${isOutsourced ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                <Tag size={12} />
                {formData.orderType || 'Casa'}
            </span>
            </h2>
            <span className="text-xs text-gray-500 mt-1">
                {isOutsourced ? 'Pedido realizado para parceiro terceirizado.' : 'Pedido interno da estamparia.'}
            </span>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente / Parceiro</label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                required
                name="customerName"
                value={formData.customerName || ''}
                onChange={handleChange}
                type="text"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder={isOutsourced ? "Nome do Terceirizado" : "Ex: João da Silva"}
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
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Valor Pago (R$)</label>
                    <button
                        type="button"
                        onClick={handleMarkAsFullyPaid}
                        className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-200 transition-colors"
                        title="Marcar como totalmente pago"
                    >
                        <CheckCircle2 size={12} />
                        Pago Integral
                    </button>
                </div>
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
                <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
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
          <div className="mr-auto text-xs text-gray-400 flex items-center gap-1">
             Criado por: {formData.createdBy || currentUser}
          </div>
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