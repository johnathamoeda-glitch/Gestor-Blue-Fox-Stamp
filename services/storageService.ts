import { Order, Activity, OrderStatus, ProfitCalculation, Expense, ChatMessage, UserCredentials, SystemSettings } from '../types';
import { pushDataToCloud, pullDataFromCloud } from './supabaseClient';

const STORAGE_KEY = 'estampa_gestor_orders';
const ACTIVITIES_STORAGE_KEY = 'gestor_bfs_activities';
const PROFIT_CALC_STORAGE_KEY = 'gestor_bfs_profits';
const EXPENSES_STORAGE_KEY = 'gestor_bfs_expenses';
const CHAT_STORAGE_KEY = 'gestor_bfs_chat_messages';
const USERS_STORAGE_KEY = 'gestor_bfs_users_v1';
const SETTINGS_KEY = 'gestor_bfs_settings';

// --- Helper for ID Generation ---
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- SETTINGS & SYNC ---

export const getSettings = (): SystemSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { supabaseUrl: '', supabaseKey: '', autoSync: false };
  } catch {
    return { supabaseUrl: '', supabaseKey: '', autoSync: false };
  }
};

export const saveSettings = (settings: SystemSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Trigger a background sync for a specific entity type
const triggerSync = (type: 'orders' | 'activities' | 'expenses' | 'profits' | 'chat') => {
  const settings = getSettings();
  if (!settings.autoSync || !settings.supabaseUrl) return;

  // We fire and forget
  setTimeout(async () => {
    switch(type) {
      case 'orders': await pushDataToCloud('orders', getOrders()); break;
      case 'activities': await pushDataToCloud('activities', getActivities()); break;
      case 'expenses': await pushDataToCloud('expenses', getExpenses()); break;
      case 'profits': await pushDataToCloud('profit_calculations', getProfitCalculations()); break;
      case 'chat': await pushDataToCloud('chat_messages', getChatMessages()); break;
    }
  }, 100);
};

export const syncAllFromCloud = async (): Promise<boolean> => {
    try {
        const settings = getSettings();
        if (!settings.supabaseUrl) return false;

        const orders = await pullDataFromCloud('orders');
        if (orders) localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

        const activities = await pullDataFromCloud('activities');
        if (activities) localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));

        const expenses = await pullDataFromCloud('expenses');
        if (expenses) localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
        
        const profits = await pullDataFromCloud('profit_calculations');
        if (profits) localStorage.setItem(PROFIT_CALC_STORAGE_KEY, JSON.stringify(profits));

        const chat = await pullDataFromCloud('chat_messages');
        if (chat) localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chat));

        return true;
    } catch (e) {
        console.error("Sync all failed", e);
        return false;
    }
};

// --- Auth & Users ---

export const initializeAuth = (): void => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    const defaultUsers: UserCredentials[] = [
      { username: 'Luzinho', password: 'fox375' },
      { username: 'Luciano', password: 'fox375' },
      { username: 'Joohn', password: 'fox375' }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  }
};

export const verifyLogin = (username: string, password: string): boolean => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    const users: UserCredentials[] = data ? JSON.parse(data) : [];
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.password === password) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const updateUserPassword = (username: string, newPassword: string): boolean => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    const users: UserCredentials[] = data ? JSON.parse(data) : [];
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex >= 0) {
      users[userIndex].password = newPassword;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// --- Orders ---

export const getOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const existingIndex = orders.findIndex(o => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  triggerSync('orders');
};

export const deleteOrder = (id: string): void => {
  const orders = getOrders();
  const newOrders = orders.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
  triggerSync('orders');
};

// --- Activities ---

export const getActivities = (): Activity[] => {
  try {
    const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveActivity = (activity: Activity): void => {
  const activities = getActivities();
  const existingIndex = activities.findIndex(a => a.id === activity.id);
  if (existingIndex >= 0) {
    activities[existingIndex] = activity;
  } else {
    activities.push(activity);
  }
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  triggerSync('activities');
};

export const deleteActivity = (id: string): void => {
  const activities = getActivities();
  const newActivities = activities.filter(a => a.id !== id);
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(newActivities));
  triggerSync('activities');
};

export const toggleActivityCompletion = (id: string): void => {
  const activities = getActivities();
  const activity = activities.find(a => a.id === id);
  if (activity) {
    activity.completed = !activity.completed;
    saveActivity(activity); // handles sync
  }
};

// --- Profit Calculations ---

export const getProfitCalculations = (): ProfitCalculation[] => {
  try {
    const data = localStorage.getItem(PROFIT_CALC_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getProfitCalculationByOrderId = (orderId: string): ProfitCalculation | undefined => {
  const calcs = getProfitCalculations();
  return calcs.find(c => c.orderId === orderId);
};

export const saveProfitCalculation = (calc: ProfitCalculation): void => {
  const calcs = getProfitCalculations();
  const existingIndex = calcs.findIndex(c => c.orderId === calc.orderId);
  if (existingIndex >= 0) {
    calcs[existingIndex] = calc;
  } else {
    calcs.push(calc);
  }
  localStorage.setItem(PROFIT_CALC_STORAGE_KEY, JSON.stringify(calcs));
  triggerSync('profits');
};

// --- Expenses ---

export const getExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  triggerSync('expenses');
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  const newExpenses = expenses.filter(e => e.id !== id);
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(newExpenses));
  triggerSync('expenses');
};

// --- Chat Messages ---

export const getChatMessages = (): ChatMessage[] => {
  try {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveChatMessage = (message: ChatMessage): void => {
  const messages = getChatMessages();
  const existingIndex = messages.findIndex(m => m.id === message.id);
  
  if (existingIndex >= 0) {
    messages[existingIndex] = message;
  } else {
    if (messages.length > 100) messages.shift();
    messages.push(message);
  }
  
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  triggerSync('chat');
};

export const deleteChatMessage = (id: string): void => {
  const messages = getChatMessages();
  const newMessages = messages.filter(m => m.id !== id);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
  triggerSync('chat');
};
