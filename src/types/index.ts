export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  product: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  notes: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  type: 'follow_up' | 'meeting' | 'payment' | 'task' | 'custom';
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalSales: number;
  pendingSales: number;
  completedSales: number;
  totalRevenue: number;
  pendingReminders: number;
  highPriorityReminders: number;
}
