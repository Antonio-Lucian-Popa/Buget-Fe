import { useState, useEffect } from 'react';
import { Income } from '../types';
import { api } from '../lib/api';
import { Plus, TrendingUp, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { formatRON } from '../utils/format-number';
import FullScreenLoader from '../components/FullScreenLoader';

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

  const totalIncome = incomes.reduce(
    (sum, income) => sum + (income.amount ?? 0),
    0
  );
  const recurringCount = incomes.filter((i) => i.is_recurring === 1).length;

  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Venituri
          </h2>
          <p className="text-gray-600 mt-1">
            Gestionează sursele tale de venit
          </p>
          {incomes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-green-700 border border-green-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                {incomes.length} înregistrări
              </span>
              {recurringCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {recurringCount} recurente
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă venit</span>
        </button>
      </div>

      {/* Carduri statistici */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl bg-white/20 p-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  Total venituri
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold leading-tight">
                {formatRON(totalIncome)}
              </div>
              <p className="text-xs mt-2 text-white/80">
                Include toate veniturile înregistrate în aplicație.
              </p>
            </div>
            {totalIncome > 0 && (
              <div className="bg-black/10 rounded-2xl px-4 py-3 text-xs sm:text-sm flex flex-col gap-1 min-w-[180px]">
                <div className="flex justify-between">
                  <span className="text-white/80">Venit mediu</span>
                  <span className="font-semibold text-white">
                    {formatRON(totalIncome / incomes.length)}
                  </span>
                </div>
                {recurringCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Pondere recurente</span>
                    <span className="font-semibold text-white">
                      {((recurringCount / incomes.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Rezumat rapid
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Număr venituri</span>
              <span className="font-semibold text-gray-900">
                {incomes.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Venituri recurente</span>
              <span className="font-semibold text-gray-900">
                {recurringCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ultimul venit</span>
              <span className="font-semibold text-gray-900">
                {incomes.length > 0
                  ? new Date(
                      sortedIncomes[0].date
                    ).toLocaleDateString('ro-RO')
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de venituri */}
      {incomes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Niciun venit adăugat
          </h3>
          <p className="text-gray-600 mb-4">
            Adaugă primul tău venit pentru a începe să urmărești finanțele.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă venit</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista veniturilor
            </h3>
            <p className="text-xs text-gray-500">
              Cele mai recente venituri apar primele
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedIncomes.map((income) => (
              <div
                key={income.id}
                className="bg-gradient-to-br from-white to-green-50/50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {income.description || 'Venit fără descriere'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(income.date).toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                    {income.is_recurring === 1 && (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-blue-50 text-[11px] text-blue-700">
                        <RefreshCw className="w-3 h-3" />
                        Recurent
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Șterge venitul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between gap-3 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Sumă</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatRON(income.amount ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal adăugare venit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Adaugă venit
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Introdu detaliile venitului pentru a-l urmări mai ușor în
                  timp.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descriere
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="ex: Salariu, Freelancer, Bonus"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sumă (RON)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.is_recurring}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_recurring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="recurring"
                  className="text-sm font-medium text-gray-700"
                >
                  Venit recurent (lunar)
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium shadow-sm"
                >
                  Adaugă venit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
