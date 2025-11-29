import { useState, useEffect } from 'react';
import { Debt } from '../types';
import { api } from '../lib/api';
import { Plus, CreditCard, Trash2, Calendar, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatRON } from '../utils/format-number';

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    category: 'altele',
  });

  const categories = [
    { value: 'chirie', label: 'Chirie' },
    { value: 'utilitati', label: 'Utilități' },
    { value: 'rate', label: 'Rate' },
    { value: 'imprumuturi', label: 'Împrumuturi' },
    { value: 'altele', label: 'Altele' },
  ];

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const response = await api.debts.getAll();
      setDebts(response.debts || []);
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.debts.create({
        amount: parseFloat(formData.amount),
        name: formData.name,
        due_date: formData.due_date,
        is_recurring: formData.is_recurring,
        category: formData.category,
      });
      setIsModalOpen(false);
      setFormData({
        amount: '',
        name: '',
        due_date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        category: 'altele',
      });
      loadDebts();
    } catch (error) {
      console.error('Failed to create debt:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.debts.updateStatus(id, status);
      loadDebts();
    } catch (error) {
      console.error('Failed to update debt status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi această datorie?')) return;
    try {
      await api.debts.delete(id);
      loadDebts();
    } catch (error) {
      console.error('Failed to delete debt:', error);
    }
  };

  const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount ?? 0), 0);
  const pendingDebts = debts.filter(d => d.status === 'pending');
  const paidDebts = debts.filter(d => d.status === 'paid');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Plătit';
      case 'overdue':
        return 'Întârziat';
      default:
        return 'În așteptare';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Datorii</h2>
          <p className="text-gray-600 mt-1">Gestionează obligațiile tale financiare</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă datorie</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8" />
            <span className="text-lg font-medium">Total datorii</span>
          </div>
          <div className="text-3xl font-bold">{formatRON(totalDebts)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-lg font-medium text-gray-700">În așteptare</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pendingDebts.length}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-lg font-medium text-gray-700">Plătite</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{paidDebts.length}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => (
          <div key={debt.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{debt.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(debt.due_date).toLocaleDateString('ro-RO')}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">{debt.category}</div>
              </div>
              <button
                onClick={() => handleDelete(debt.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-3">{formatRON(debt.amount ?? 0)}</div>
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded border text-sm ${getStatusColor(debt.status)}`}>
                {getStatusIcon(debt.status)}
                <span>{getStatusLabel(debt.status)}</span>
              </div>
              {debt.is_recurring === 1 && (
                <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <RefreshCw className="w-4 h-4" />
                </div>
              )}
            </div>
            {debt.status !== 'paid' && (
              <button
                onClick={() => handleStatusChange(debt.id, 'paid')}
                className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
              >
                Marchează ca plătit
              </button>
            )}
          </div>
        ))}
      </div>

      {debts.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nicio datorie adăugată</h3>
          <p className="text-gray-600">Începe prin a adăuga prima ta datorie</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Adaugă datorie</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ex: Chirie"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumă (RON)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data scadenței
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring-debt"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring-debt" className="text-sm font-medium text-gray-700">
                  Datorie recurentă
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Adaugă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
