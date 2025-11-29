import { useState, useEffect } from 'react';
import { Transaction, Debt } from '../types';
import { api } from '../lib/api';
import {
  Plus,
  History,
  Calendar,
  FileText,
  TrendingDown,
} from 'lucide-react';
import { formatRON } from '../utils/format-number';
import FullScreenLoader from '../components/FullScreenLoader';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    debt_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, debtsRes] = await Promise.all([
        api.transactions.getAll(),
        api.debts.getAll(),
      ]);
      setTransactions(transactionsRes.transactions || []);
      setDebts(debtsRes.debts || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.transactions.create({
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note || undefined,
        debt_id: formData.debt_id ? parseInt(formData.debt_id) : undefined,
      });
      setIsModalOpen(false);
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        debt_id: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const getDebtName = (debtId?: number) => {
    if (!debtId) return 'Plată generală';
    const debt = debts.find((d) => d.id === debtId);
    return debt ? debt.name : 'Datorie necunoscută';
  };

  const totalTransactions = transactions.reduce(
    (sum, t) => sum + (t.amount ?? 0),
    0
  );

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const averagePayment =
    transactions.length > 0 ? totalTransactions / transactions.length : 0;

  const lastPaymentDate =
    sortedTransactions.length > 0
      ? new Date(sortedTransactions[0].date).toLocaleDateString('ro-RO')
      : null;

  if (isLoading) {
   return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Istoric tranzacții
          </h2>
          <p className="text-gray-600 mt-1">
            Vezi toate plățile efectuate pentru datoriile tale
          </p>
          {transactions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100">
                <History className="w-3 h-3 mr-1" />
                {transactions.length} tranzacții
              </span>
              {lastPaymentDate && (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-gray-700 border border-gray-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  Ultima plată: {lastPaymentDate}
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
          <span>Adaugă tranzacție</span>
        </button>
      </div>

      {/* Carduri statistici */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl bg-white/20 p-2">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  Total plăți efectuate
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold leading-tight">
                {formatRON(totalTransactions)}
              </div>
              <p className="text-xs mt-2 text-white/80">
                Include toate tranzacțiile înregistrate în timp.
              </p>
            </div>
            {transactions.length > 0 && (
              <div className="bg-black/10 rounded-2xl px-4 py-3 text-xs sm:text-sm flex flex-col gap-1 min-w-[180px]">
                <div className="flex justify-between">
                  <span className="text-white/80">Plată medie</span>
                  <span className="font-semibold text-white">
                    {formatRON(averagePayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Număr tranzacții</span>
                  <span className="font-semibold text-white">
                    {transactions.length}
                  </span>
                </div>
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
              <span className="text-gray-600">Tranzacții totale</span>
              <span className="font-semibold text-gray-900">
                {transactions.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total plăți</span>
              <span className="font-semibold text-gray-900">
                {formatRON(totalTransactions)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ultima tranzacție</span>
              <span className="font-semibold text-gray-900">
                {lastPaymentDate ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista tranzacții */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nicio tranzacție
          </h3>
          <p className="text-gray-600 mb-4">
            Începe prin a adăuga prima ta tranzacție și vei vedea istoricul
            plăților aici.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă tranzacție</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Istoric plăți
            </h3>
            <p className="text-xs text-gray-500">
              Cele mai recente tranzacții apar primele
            </p>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50/60 to-white hover:from-blue-100/70 hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <History className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {getDebtName(transaction.debt_id)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(
                            transaction.date
                          ).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                      {transaction.note && (
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{transaction.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatRON(transaction.amount ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal adăugare tranzacție */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Adaugă tranzacție
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Înregistrează o nouă plată, cu sau fără asociere la o datorie.
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datorie asociată (opțional)
                </label>
                <select
                  value={formData.debt_id}
                  onChange={(e) =>
                    setFormData({ ...formData, debt_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="">Nicio datorie</option>
                  {debts.map((debt) => (
                    <option key={debt.id} value={debt.id}>
                      {debt.name} - {formatRON(debt.amount ?? 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notă (opțional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  rows={3}
                  placeholder="Detalii suplimentare despre plată..."
                />
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
                  Adaugă tranzacție
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
