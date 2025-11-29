import { useState, useEffect } from 'react';
import { Income } from '../types';
import { api } from '../lib/api';
import { Plus, TrendingUp, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { formatRON } from '../utils/format-number';

export default function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const response = await api.incomes.getAll();
      setIncomes(response.incomes || []);
    } catch (error) {
      console.error('Failed to load incomes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.incomes.create({
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        is_recurring: formData.is_recurring,
      });
      setIsModalOpen(false);
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
      });
      loadIncomes();
    } catch (error) {
      console.error('Failed to create income:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest venit?')) return;
    try {
      await api.incomes.delete(id);
      loadIncomes();
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + (income.amount ?? 0), 0);


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
          <h2 className="text-3xl font-bold text-gray-900">Venituri</h2>
          <p className="text-gray-600 mt-1">Gestionează sursele tale de venit</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă venit</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8" />
          <span className="text-lg font-medium">Total venituri</span>
        </div>
        <div className="text-4xl font-bold">{formatRON(totalIncome)}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incomes.map((income) => (
          <div key={income.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{income.description}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(income.date).toLocaleDateString('ro-RO')}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(income.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600">{formatRON(income.amount)}</div>
              {income.is_recurring === 1 && (
                <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <RefreshCw className="w-4 h-4" />
                  <span>Recurent</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {incomes.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Niciun venit adăugat</h3>
          <p className="text-gray-600">Începe prin a adăuga primul tău venit</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Adaugă venit</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ex: Salariu"
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
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                  Venit recurent
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
