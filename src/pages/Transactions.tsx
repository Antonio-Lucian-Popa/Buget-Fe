import { useState, useEffect } from 'react';
import { Transaction, Debt } from '../types';
import { api } from '../lib/api';
import { Plus, History, Calendar, FileText, TrendingDown } from 'lucide-react';

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
    const debt = debts.find(d => d.id === debtId);
    return debt ? debt.name : 'Datorie necunoscută';
  };

  const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);

  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
          <h2 className="text-3xl font-bold text-gray-900">Istoric Tranzacții</h2>
          <p className="text-gray-600 mt-1">Toate plățile efectuate</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Adaugă tranzacție</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="w-8 h-8" />
          <span className="text-lg font-medium">Total plăți efectuate</span>
        </div>
        <div className="text-4xl font-bold">{totalTransactions.toFixed(2)} RON</div>
        <div className="text-sm mt-2 opacity-90">{transactions.length} tranzacții</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sortedTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <History className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {getDebtName(transaction.debt_id)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(transaction.date).toLocaleDateString('ro-RO')}</span>
                      </div>
                      {transaction.note && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{transaction.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 sm:text-right">
                    {transaction.amount.toFixed(2)} RON
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nicio tranzacție</h3>
            <p className="text-gray-600">Începe prin a adăuga prima ta tranzacție</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Adaugă tranzacție</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datorie asociată (opțional)
                </label>
                <select
                  value={formData.debt_id}
                  onChange={(e) => setFormData({ ...formData, debt_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Nicio datorie</option>
                  {debts.map((debt) => (
                    <option key={debt.id} value={debt.id}>
                      {debt.name} - {debt.amount.toFixed(2)} RON
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notă (opțional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Detalii suplimentare..."
                />
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
