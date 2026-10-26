import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Sale, Reminder, DashboardStats } from '../types';

interface CRMContextType {
  clients: Client[];
  sales: Sale[];
  reminders: Reminder[];
  stats: DashboardStats;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  notifications: Reminder[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const loadData = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => loadData('crm_clients', []));
  const [sales, setSales] = useState<Sale[]>(() => loadData('crm_sales', []));
  const [reminders, setReminders] = useState<Reminder[]>(() => loadData('crm_reminders', []));

  useEffect(() => { localStorage.setItem('crm_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('crm_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('crm_reminders', JSON.stringify(reminders)); }, [reminders]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setClients(prev => [...prev, { ...client, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    setSales(prev => [...prev, { ...sale, id: generateId(), createdAt: new Date().toISOString() }]);
  };

  const updateSale = (id: string, data: Partial<Sale>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    setReminders(prev => [...prev, { ...reminder, id: generateId(), createdAt: new Date().toISOString() }]);
  };

  const updateReminder = (id: string, data: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const stats: DashboardStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalSales: sales.length,
    pendingSales: sales.filter(s => s.status === 'pending').length,
    completedSales: sales.filter(s => s.status === 'completed').length,
    totalRevenue: sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.amount, 0),
    pendingReminders: reminders.filter(r => !r.completed).length,
    highPriorityReminders: reminders.filter(r => !r.completed && r.priority === 'high').length,
  };

  const notifications = reminders.filter(r => {
    if (r.completed) return false;
    const dueDate = new Date(r.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  return (
    <CRMContext.Provider value={{
      clients, sales, reminders, stats, notifications,
      addClient, updateClient, deleteClient,
      addSale, updateSale, deleteSale,
      addReminder, updateReminder, deleteReminder,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
};
