export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Produção',
  READY = 'Pronto',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado'
}

export type OrderType = 'Casa' | 'Terceirizado';

export interface Order {
  id: string;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  description: string;
  itemsDetails: string;
  totalValue: number;
  paidValue: number;
  createdAt: number; // Timestamp
  deliveryDate: number; // Timestamp
  status: OrderStatus;
  notaFiscalIssued: boolean;
  notes?: string;
  remainingPaymentDate?: number;
  createdBy?: string; // Nome do usuário que criou o pedido
}

export interface DashboardStats {
  totalRevenue: number;
  totalPending: number;
  activeOrders: number;
  ordersReadyWaitPickup: number;
}

export type ActivityPriority = 'low' | 'medium' | 'high';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: number; // Timestamp da data agendada
  priority: ActivityPriority;
  completed: boolean;
}

export interface ProfitCalculation {
  orderId: string;
  revenue: number;
  costFabric: number;
  costSewing: number;
  costPrint: number;
  costMisc: number;
  lastUpdated: number;
}