import React, { useState, useEffect } from 'react';
import { Order, OrderType } from './types';
import { getOrders, saveOrder, deleteOrder, initializeAuth, verifyLogin } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import { ScheduledActivities } from './components/ScheduledActivities';
import { Analytics } from './components/Analytics';
import { ProfitCalculator } from './components/ProfitCalculator';
import { Expenses } from './components/Expenses';
import { Chat } from './components/Chat';
import { LoginScreen } from './components/LoginScreen';
import { UserProfile } from './components/UserProfile';
import { LayoutDashboard, PlusCircle, List, CalendarCheck, BarChart2, LogOut, Home, Briefcase, X, Calculator, Wallet, MessageCircle, User, Settings } from 'lucide-react';

// Custom T-Shirt Icon Component
const TShirtIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
  </svg>
);

const App: React.FC = () => {
  // Authentication State holding the username
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return sessionStorage.getItem('bfs_user_session');
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'form' | 'activities' | 'analytics' | 'calculator' | 'expenses' | 'chat'>('dashboard');
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  
  // Logic for selecting order type
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>('Casa');

  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Ensure default users exist in local storage
    initializeAuth();

    if (currentUser) {
      refreshOrders();
    }
  }, [currentUser]);

  const refreshOrders = () => {
    setOrders(getOrders());
  };

  const handleLogin = (u: string, p: string): boolean => {
    const isValid = verifyLogin(u, p);

    if (isValid) {
      // Normalize user casing based on input to keep it consistent or strictly follow storage?
      // For now, capitalize first letter for display niceness
      const displayUser = u.charAt(0).toUpperCase() + u.slice(1);
      
      setCurrentUser(displayUser);
      sessionStorage.setItem('bfs_user_session', displayUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('bfs_user_session');
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
    setSelectedOrderType(order.orderType || 'Casa');
    setView('form');
  };

  const openNewOrderModal = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleStartNewOrder = (type: OrderType) => {
      setSelectedOrderType(type);
      setIsNewOrderModalOpen(false);
      setEditingOrder(undefined);
      setView('form');
  };

  // Login Guard
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 relative">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 md:top-0 md:left-0 md:w-64 md:h-screen md:border-t-0 md:border-r flex md:flex-col justify-around md:justify-start md:p-4 shadow-lg md:shadow-none overflow-x-auto md:overflow-x-visible no-scrollbar">
        
        <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <TShirtIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">Gestor Blue Fox Stamp</h1>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="text-xs text-gray-400 mt-1 flex items-center gap-1 hover:text-indigo-600 transition-colors"
                title="Editar Perfil / Trocar Senha"
              >
                <User size={10} /> Olá, {currentUser} <Settings size={10} className="ml-1" />
              </button>
            </div>
        </div>

        {/* Novo Pedido Action (Moved to Top) */}
        <button 
          onClick={openNewOrderModal}
          className="flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl text-indigo-600 md:bg-indigo-600 md:text-white md:hover:bg-indigo-700 transition-all md:shadow-md min-w-[70px] md:min-w-0 md:mb-6"
        >
          <PlusCircle size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Novo Pedido</span>
        </button>

        {/* 1. Painel */}
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'dashboard' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Painel</span>
        </button>

        {/* 2. Pedidos */}
        <button 
          onClick={() => setView('list')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'list' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <List size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Pedidos</span>
        </button>

        {/* 3. Calculadora */}
        <button 
          onClick={() => setView('calculator')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'calculator' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <Calculator size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Calculadora</span>
        </button>

        {/* 4. Gastos */}
        <button 
          onClick={() => setView('expenses')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'expenses' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Gastos</span>
        </button>

        {/* 5. Relatórios */}
        <button 
          onClick={() => setView('analytics')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'analytics' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <BarChart2 size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Relatórios</span>
        </button>

        {/* 6. Atividades */}
        <button 
          onClick={() => setView('activities')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'activities' ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          <CalendarCheck size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Atividades</span>
        </button>

        {/* 7. Chat (Bate Papo) */}
        <button 
          onClick={() => setView('chat')}
          className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all min-w-[70px] md:min-w-0 ${view === 'chat' ? 'text-green-600 md:bg-green-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
        >
          <MessageCircle size={24} />
          <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Bate Papo</span>
        </button>
        
        <div className="hidden md:block flex-grow"></div>
        
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
                    <TShirtIcon size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Gestor Blue Fox Stamp</h1>
                  <button onClick={() => setIsProfileOpen(true)} className="text-[10px] text-gray-500 flex items-center gap-1">
                    <User size={10} /> Olá, {currentUser}
                  </button>
                </div>
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
               <button onClick={openNewOrderModal} className="md:hidden bg-indigo-600 text-white p-2 rounded-full shadow-lg">
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
           <ScheduledActivities currentUser={currentUser || 'Sistema'} />
        )}

        {view === 'expenses' && (
           <Expenses currentUser={currentUser || 'Desconhecido'} />
        )}

        {view === 'calculator' && (
            <ProfitCalculator orders={orders} />
        )}

        {view === 'chat' && (
            <Chat currentUser={currentUser || 'Usuário'} />
        )}

        {view === 'form' && (
          <div className="space-y-6 max-w-3xl mx-auto">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 cursor-pointer" onClick={() => setView('list')}>
                <span className="text-gray-400 hover:text-gray-600">Pedidos /</span> 
                {editingOrder ? ' Editar' : ' Novo'}
             </h2>
            <OrderForm 
              existingOrder={editingOrder} 
              initialOrderType={selectedOrderType}
              currentUser={currentUser}
              onSave={handleSaveOrder} 
              onCancel={() => setView('list')} 
            />
          </div>
        )}
      </main>

      {/* New Order Type Selection Modal */}
      {isNewOrderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Criar Novo Pedido</h3>
                      <button onClick={() => setIsNewOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm">Selecione o tipo de pedido para iniciar o cadastro:</p>
                  
                  <div className="space-y-3">
                      <button 
                          onClick={() => handleStartNewOrder('Casa')}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition-all group"
                      >
                          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Home size={24} />
                          </div>
                          <div className="text-left">
                              <p className="font-bold text-gray-800 group-hover:text-indigo-700">Pedido da Casa</p>
                              <p className="text-xs text-gray-500">Pedidos internos padrão</p>
                          </div>
                      </button>

                      <button 
                          onClick={() => handleStartNewOrder('Terceirizado')}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-orange-100 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50 transition-all group"
                      >
                          <div className="bg-orange-100 text-orange-600 p-3 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                              <Briefcase size={24} />
                          </div>
                          <div className="text-left">
                              <p className="font-bold text-gray-800 group-hover:text-orange-700">Pedido Terceirizado</p>
                              <p className="text-xs text-gray-500">Para clientes parceiros</p>
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* User Profile Modal */}
      {isProfileOpen && currentUser && (
          <UserProfile 
            username={currentUser} 
            onClose={() => setIsProfileOpen(false)} 
          />
      )}
    </div>
  );
};

export default App;