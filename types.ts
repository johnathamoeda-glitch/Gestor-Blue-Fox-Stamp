
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
  createdBy?: string;
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

export type ExpenseCategory = 'Material' | 'Funcionário' | 'Maquinário' | 'Aluguel' | 'Manutenção' | 'Outros';

export interface Expense {
  id: string;
  description: string;
  value: number;
  category: ExpenseCategory;
  date: number;
  createdBy: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string; // Texto ou Base64 da mídia
  type: MessageType;
  timestamp: number;
  edited: boolean;
  replyTo?: string; // ID da mensagem respondida (opcional futura expansão)
}