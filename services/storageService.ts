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

export const generateMockOrders = (): void => {
  const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Kleber', 'Larissa', 'Marcos', 'Natalia', 'Otavio', 'Patricia', 'Rafael', 'Sandra', 'Tiago', 'Vanessa'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];
  
  const items = [
    'Camisas Polo Bordadas', 'Fardamento Completo', 'Abadás Personalizados', 
    'Camisetas Promocionais', 'Uniformes Escolares', 'Bonés Personalizados',
    'Jalecos Bordados', 'Camisas de Time', 'Ecobags Estampadas'
  ];

  const mockOrders: Order[] = [];

  for (let i = 0; i < 250; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    
    // Date distribution: spread over last 12 months
    const dateOffset = Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000);
    const createdAt = Date.now() - dateOffset;
    
    // Status logic
    const statusKeys = Object.values(OrderStatus);
    const status = statusKeys[Math.floor(Math.random() * statusKeys.length)];
    
    // Financial logic
    const totalValue = Math.floor(Math.random() * 4500) + 150; // 150 to 4650
    let paidValue = 0;
    let remainingPaymentDate: number | undefined = undefined;

    if (status === OrderStatus.DELIVERED) {
       // 80% chance of being fully paid if delivered, 20% debt
       paidValue = Math.random() > 0.2 ? totalValue : totalValue * 0.5;
    } else if (status === OrderStatus.CANCELLED) {
       paidValue = 0;
    } else {
       // Random partial payment
       paidValue = Math.random() > 0.3 ? totalValue * 0.5 : 0;
    }

    if (paidValue < totalValue && status !== OrderStatus.CANCELLED) {
        // Set a payment date. Some in past (overdue), some in future.
        const days = Math.floor(Math.random() * 20) - 5; // -5 to +15 days from creation or delivery
        remainingPaymentDate = createdAt + (days * 86400000);
    }

    mockOrders.push({
      id: generateId(),
      customerName: `${firstName} ${lastName}`,
      customerPhone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
      description: `${Math.floor(Math.random() * 50) + 10}x ${item}`,
      itemsDetails: 'Estampa frente e costas, tecido PV.',
      totalValue,
      paidValue,
      createdAt,
      deliveryDate: createdAt + (86400000 * 7), // 7 days after creation
      status,
      notaFiscalIssued: Math.random() > 0.6, // 40% chance of missing NF
      remainingPaymentDate
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
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