export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Produção',
  READY = 'Pronto',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado'
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  description: string;
  itemsDetails: string; // Detalhes como tamanhos, cores
  totalValue: number;
  paidValue: number;
  createdAt: number; // Timestamp
  deliveryDate: number; // Timestamp
  status: OrderStatus;
  notaFiscalIssued: boolean;
  notes?: string;
  remainingPaymentDate?: number; // Data combinada para o pagamento do restante
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