import { Order, Activity, OrderStatus } from '../types';

const STORAGE_KEY = 'estampa_gestor_orders';
const ACTIVITIES_STORAGE_KEY = 'gestor_bfs_activities';

// --- Helper for ID Generation (replaces crypto.randomUUID for better compatibility) ---
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Orders ---

export const getOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load orders", e);
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
};

export const deleteOrder = (id: string): void => {
  const orders = getOrders();
  const newOrders = orders.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
};

// --- Activities ---

export const getActivities = (): Activity[] => {
  try {
    const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load activities", e);
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
};

export const deleteActivity = (id: string): void => {
  const activities = getActivities();
  const newActivities = activities.filter(a => a.id !== id);
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(newActivities));
};

export const toggleActivityCompletion = (id: string): void => {
  const activities = getActivities();
  const activity = activities.find(a => a.id === id);
  if (activity) {
    activity.completed = !activity.completed;
    saveActivity(activity);
  }
};