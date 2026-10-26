import React from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Users, ShoppingCart, DollarSign, Bell,
  TrendingUp, TrendingDown, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { stats, sales, reminders, clients } = useCRM();

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClients,
      subtitle: `${stats.activeClients} activos`,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Ventas Totales',
      value: stats.totalSales,
      subtitle: `${stats.completedSales} completadas`,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Ingresos',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      subtitle: `${stats.pendingSales} pendientes`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Recordatorios',
      value: stats.pendingReminders,
      subtitle: `${stats.highPriorityReminders} alta prioridad`,
      icon: Bell,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
      trend: stats.highPriorityReminders > 0 ? 'Urgente' : 'Al día',
      trendUp: stats.highPriorityReminders === 0,
    },
  ];

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const upcomingReminders = [...reminders]
    .filter(r => !r.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-400">
          Bienvenido de nuevo. Aquí tienes un resumen de tu negocio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                card.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-sm text-slate-400">{card.subtitle}</p>
            <p className="text-xs text-slate-500 mt-2">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              Ventas Recientes
            </h2>
            <a href="/ventas" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          {recentSales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay ventas registradas</p>
              <a href="/ventas" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                Registrar primera venta →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    sale.status === 'completed' ? 'bg-emerald-400' :
                    sale.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sale.product}</p>
                    <p className="text-xs text-slate-400">{sale.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">${sale.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(sale.date), 'dd MMM', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Próximos Recordatorios
            </h2>
            <a href="/recordatorios" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay recordatorios pendientes</p>
              <a href="/recordatorios" className="text-amber-400 text-sm hover:underline mt-2 inline-block">
                Crear recordatorio →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    reminder.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    reminder.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{reminder.title}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(reminder.dueDate), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    reminder.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    reminder.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Clientes Recientes
          </h2>
          <a href="/clientes" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        {recentClients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay clientes registrados</p>
            <a href="/clientes" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
              Agregar primer cliente →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentClients.map(client => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{client.name}</p>
                  <p className="text-xs text-slate-400 truncate">{client.company || client.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  client.status === 'prospect' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {client.status === 'active' ? 'Activo' : client.status === 'prospect' ? 'Prospecto' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/clientes" className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/50 hover:border-emerald-500/30 group">
            <Users className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white">Nuevo Cliente</p>
              <p className="text-xs text-slate-400">Registrar contacto</p>
            </div>
          </a>
          <a href="/ventas" className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/50 hover:border-emerald-500/30 group">
            <ShoppingCart className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white">Nueva Venta</p>
              <p className="text-xs text-slate-400">Registrar transacción</p>
            </div>
          </a>
          <a href="/recordatorios" className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/50 hover:border-emerald-500/30 group">
            <Bell className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white">Nuevo Recordatorio</p>
              <p className="text-xs text-slate-400">Programar tarea</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
