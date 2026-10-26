import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Reminder } from '../types';
import { Plus, Search, Trash2, X, Check, Clock, AlertTriangle, Bell, Calendar } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

const RemindersPage: React.FC = () => {
  const { reminders, clients, addReminder, updateReminder, deleteReminder } = useCRM();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', clientId: '', clientName: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as Reminder['priority'],
    type: 'task' as Reminder['type'],
    completed: false
  });

  const filteredReminders = reminders.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesPriority = filterPriority === 'all' || r.priority === filterPriority;
    const matchesCompleted = showCompleted || !r.completed;
    return matchesSearch && matchesType && matchesPriority && matchesCompleted;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    if (isPast(date)) return 'Vencido';
    return format(date, "dd 'de' MMM", { locale: es });
  };

  const getDueDateColor = (dateStr: string, completed: boolean) => {
    if (completed) return 'text-slate-500';
    const date = new Date(dateStr);
    if (isPast(date)) return 'text-red-400';
    if (isToday(date)) return 'text-amber-400';
    return 'text-slate-400';
  };

  const typeLabels: Record<Reminder['type'], string> = {
    follow_up: 'Seguimiento',
    meeting: 'Reunión',
    payment: 'Pago',
    task: 'Tarea',
    custom: 'Personalizado'
  };

  const typeIcons: Record<Reminder['type'], string> = {
    follow_up: '📞',
    meeting: '🤝',
    payment: '💰',
    task: '✅',
    custom: '📌'
  };

  const openNew = () => {
    setForm({
      title: '', description: '', clientId: '', clientName: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium', type: 'task', completed: false
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.clientId);
    addReminder({ ...form, clientName: client?.name || '' });
    setShowModal(false);
  };

  const toggleComplete = (reminder: Reminder) => {
    updateReminder(reminder.id, { completed: !reminder.completed });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recordatorios</h1>
          <p className="text-slate-400 mt-1">Nunca pierdas un seguimiento importante</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Nuevo Recordatorio
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{reminders.filter(r => !r.completed).length}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{reminders.filter(r => !r.completed && isPast(new Date(r.dueDate))).length}</p>
          <p className="text-xs text-slate-400">Vencidos</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{reminders.filter(r => !r.completed && isToday(new Date(r.dueDate))).length}</p>
          <p className="text-xs text-slate-400">Para hoy</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{reminders.filter(r => r.completed).length}</p>
          <p className="text-xs text-slate-400">Completados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar recordatorios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500/50 transition-all"
        >
          <option value="all">Todos los tipos</option>
          <option value="follow_up">Seguimiento</option>
          <option value="meeting">Reunión</option>
          <option value="payment">Pago</option>
          <option value="task">Tarea</option>
          <option value="custom">Personalizado</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500/50 transition-all"
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <label className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500/25"
          />
          <span className="text-sm text-slate-300 whitespace-nowrap">Completados</span>
        </label>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {search || filterType !== 'all' || filterPriority !== 'all' ? 'Sin resultados' : 'No hay recordatorios'}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {search || filterType !== 'all' || filterPriority !== 'all'
              ? 'Intenta con otros filtros'
              : 'Crea tu primer recordatorio para no olvidar nada'}
          </p>
          {!search && filterType === 'all' && filterPriority === 'all' && (
            <button onClick={openNew} className="text-amber-400 hover:underline text-sm">
              + Crear recordatorio
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map(reminder => (
            <div
              key={reminder.id}
              className={`bg-slate-900/50 border rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                reminder.completed
                  ? 'border-slate-800 opacity-60'
                  : isPast(new Date(reminder.dueDate))
                    ? 'border-red-500/30 hover:border-red-500/50'
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(reminder)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    reminder.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600 hover:border-emerald-500'
                  }`}
                >
                  {reminder.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${reminder.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {typeIcons[reminder.type]} {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className={`text-sm mt-1 ${reminder.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                          {reminder.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`flex items-center gap-1 text-xs ${getDueDateColor(reminder.dueDate, reminder.completed)}`}>
                      <Calendar className="w-3 h-3" />
                      {getDueDateLabel(reminder.dueDate)} - {format(new Date(reminder.dueDate), "dd/MM/yyyy")}
                    </span>

                    {reminder.clientName && (
                      <span className="text-xs text-slate-500">
                        👤 {reminder.clientName}
                      </span>
                    )}

                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      reminder.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      reminder.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {reminder.priority === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {typeLabels[reminder.type]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nuevo Recordatorio</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                  placeholder="¿Qué necesitas recordar?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 resize-none"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Reminder['type'] })}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                  >
                    <option value="task">✅ Tarea</option>
                    <option value="follow_up">📞 Seguimiento</option>
                    <option value="meeting">🤝 Reunión</option>
                    <option value="payment">💰 Pago</option>
                    <option value="custom">📌 Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridad</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Reminder['priority'] })}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cliente (opcional)</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                  >
                    <option value="">Sin cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  Crear Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
