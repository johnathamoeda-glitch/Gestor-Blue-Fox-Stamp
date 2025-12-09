import React, { useState, useEffect } from 'react';
import { Order } from './types';
import { getOrders, saveOrder, deleteOrder, generateMockOrders } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import { ScheduledActivities } from './components/ScheduledActivities';
import { Analytics } from './components/Analytics';
import { LoginScreen } from './components/LoginScreen';
import { LayoutDashboard, PlusCircle, List, Printer, CalendarCheck, BarChart2, Database, LogOut } from 'lucide-react';

// Use standard Tailwind breakpoint classes in JSX for responsive layout logic if needed, 
// but here we just toggle views.

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bfs_auth_token') === 'authenticated';
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'form' | 'activities' | 'analytics'>('dashboard');
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    }
  }, [isAuthenticated]);

  const refreshOrders = () => {
    setOrders(getOrders());
  };

  const handleLogin = (u: string, p: string): boolean => {
    if (u === 'bluefox' && p === 'stamp375') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bfs_auth_token', 'authenticated');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bfs_auth_token');
    setView('dashboard'); // Reset view on logout
  };

  const handleSaveOrder = (order: Order) => {
    saveOrder(order);
    refreshOrders();
    setView('list');
    setEditingOrder(undefined);
  };

  const handleDeleteOrder = (id: string) => {
    deleteOrder(id);
    refreshOrders();
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setView('form');
  };

  const handleNewOrder = () => {
    setEditingOrder(undefined);
    setView('form');
  };

  const handleGenerateData = () => {
    if(window.confirm('Isso irá substituir os pedidos atuais por 250 pedidos de teste. Continuar?')) {
        try {
            generateMockOrders();
            refreshOrders();
            alert('Dados gerados com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar dados: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
        }
    }
  };

  // Login Guard
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 md:top-0 md:left-0 md:w-64 md:h-screen md:border-t-0 md:border-r flex md:flex-col justify-around md:justify-start md:p-4 shadow-lg md:shadow-none">
        
        <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Printer size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Gestor Blue Fox Stamp</h1>
        </div>

        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all ${view === 'dashboard' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Painel</span>
        </button>

        <button 
          onClick={() => setView('analytics')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all ${view === 'analytics' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <BarChart2 size={24} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Relatórios</span>
        </button>

        <button 
          onClick={() => setView('list')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all ${view === 'list' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <List size={24} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Pedidos</span>
        </button>

        <button 
          onClick={() => setView('activities')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all ${view === 'activities' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <CalendarCheck size={24} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Atividades</span>
        </button>

        <button 
          onClick={handleNewOrder}
          className="flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl text-indigo-600 md:bg-indigo-600 md:text-white md:hover:bg-indigo-700 transition-all md:mt-4 md:shadow-md"
        >
          <PlusCircle size={24} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Novo Pedido</span>
        </button>
        
        <div className="hidden md:block flex-grow"></div>
        
        <button 
          onClick={handleGenerateData}
          className="hidden md:flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all mb-2"
          title="Gera 250 pedidos aleatórios para teste"
        >
          <Database size={20} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Gerar Dados Teste</span>
        </button>

        <button 
          onClick={handleLogout}
          className="hidden md:flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all mb-2"
          title="Sair do sistema"
        >
          <LogOut size={20} />
          <span className="text-xs md:text-sm font-medium mt-1 md:mt-0">Sair</span>
        </button>

      </nav>

      {/* Main Content */}
      <main className="pb-24 pt-6 px-4 md:ml-64 md:p-8 max-w-7xl mx-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                    <Printer size={20} />
                </div>
                <h1 className="text-lg font-bold text-gray-800">Gestor Blue Fox Stamp</h1>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                <LogOut size={20} />
            </button>
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
            <Dashboard orders={orders} />
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6">
            <Analytics orders={orders} />
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">Meus Pedidos</h2>
               <button onClick={handleNewOrder} className="md:hidden bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                 <PlusCircle size={24} />
               </button>
            </div>
            <OrderList 
              orders={orders} 
              onEdit={handleEditOrder} 
              onDelete={handleDeleteOrder} 
            />
          </div>
        )}

        {view === 'activities' && (
           <ScheduledActivities />
        )}

        {view === 'form' && (
          <div className="space-y-6 max-w-3xl mx-auto">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 cursor-pointer" onClick={() => setView('list')}>
                <span className="text-gray-400 hover:text-gray-600">Pedidos /</span> 
                {editingOrder ? ' Editar' : ' Novo'}
             </h2>
            <OrderForm 
              existingOrder={editingOrder} 
              onSave={handleSaveOrder} 
              onCancel={() => setView('list')} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;