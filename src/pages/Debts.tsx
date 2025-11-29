import { useState, useEffect } from 'react';
import { Debt } from '../types';
import { api } from '../lib/api';
import {
  Plus,
  CreditCard,
  Trash2,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatRON } from '../utils/format-number';
import FullScreenLoader from '../components/FullScreenLoader';

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
  const pendingDebts = debts.filter((d) => d.status === 'pending');
  const paidDebts = debts.filter((d) => d.status === 'paid');
  const overdueDebts = debts.filter((d) => d.status === 'overdue');

  const sortedDebts = [...debts].sort(
    (a, b) =>
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
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

  const daysUntilDue = (dateStr: string) => {
    const today = new Date();
    const due = new Date(dateStr);
    const diffMs = due.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Datorii
          </h2>
          <p className="text-gray-600 mt-1">
            Gestionează toate obligațiile tale financiare lunare
          </p>
          {debts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-red-700 border border-red-100">
                <CreditCard className="w-3 h-3 mr-1" />
                {debts.length} datorii totale
              </span>
              {overdueDebts.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-orange-700 border border-orange-100">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {overdueDebts.length} întârziate
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă datorie</span>
        </button>
      </div>

      {/* Carduri statistici */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%)]" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/20 p-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Total datorii
              </span>
            </div>
            <div className="text-2xl font-bold leading-tight">
              {formatRON(totalDebts)}
            </div>
            <p className="text-xs mt-2 text-white/80">
              Include toate datoriile active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-yellow-50 p-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                În așteptare
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingDebts.length}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Datorii care nu sunt încă marcate ca plătite sau întârziate.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-green-50 p-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Plătite
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {paidDebts.length}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Datorii deja achitate în perioada curentă.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-red-50 p-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Întârziate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {overdueDebts.length}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Datorii care au depășit data scadentă.
          </p>
        </div>
      </div>

      {/* Lista de datorii */}
      {debts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nicio datorie adăugată
          </h3>
          <p className="text-gray-600 mb-4">
            Începe prin a adăuga prima ta datorie pentru a urmări plățile lunare.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă datorie</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista datoriilor
            </h3>
            <p className="text-xs text-gray-500">
              Sortate după data scadentă (cea mai apropiată prima)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedDebts.map((debt) => {
              const daysLeft = daysUntilDue(debt.due_date);
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={debt.id}
                  className="bg-gradient-to-br from-white to-red-50/40 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {debt.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(
                            debt.due_date
                          ).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 items-center">
                        {debt.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-600 capitalize">
                            {debt.category}
                          </span>
                        )}
                        {debt.is_recurring === 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-[11px] text-blue-700 gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Recurent
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[11px] text-red-700 gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Întârziat
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {isOverdue
                          ? `Depășită cu ${Math.abs(daysLeft)} zile`
                          : `Scadentă în ${daysLeft} zile`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(debt.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Șterge datoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Sumă datorată</span>
                      <span className="text-xl font-bold text-red-600">
                        {formatRON(debt.amount ?? 0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(
                          debt.status
                        )}`}
                      >
                        {getStatusIcon(debt.status)}
                        <span>{getStatusLabel(debt.status)}</span>
                      </div>
                      {debt.status !== 'paid' && (
                        <button
                          onClick={() => handleStatusChange(debt.id, 'paid')}
                          className="px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-medium transition"
                        >
                          Marchează ca plătit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal adăugare datorie */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Adaugă datorie
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Completează detaliile datoriei pentru a o urmări mai ușor.
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
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume datorie
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="ex: Chirie, Rată credit"
                    required
                  />
                </div>
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data scadenței
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="recurring-debt"
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
                  htmlFor="recurring-debt"
                  className="text-sm font-medium text-gray-700"
                >
                  Datorie recurentă (lunar)
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
                  Adaugă datorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
