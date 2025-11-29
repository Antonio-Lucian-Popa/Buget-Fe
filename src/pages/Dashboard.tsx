import { useState, useEffect } from 'react';
import { Summary } from '../types';
import { api } from '../lib/api';
import { TrendingUp, CreditCard, Wallet, Calendar, ArrowRight } from 'lucide-react';
import { formatRON } from '../utils/format-number';

export default function Dashboard() {
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [nextSummary, setNextSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'next'>('current');

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const [current, next] = await Promise.all([
        api.summary.current(),
        api.summary.next(),
      ]);
      setCurrentSummary(current);
      setNextSummary(next);
    } catch (error) {
      console.error('Failed to load summaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSummary = selectedMonth === 'current' ? currentSummary : nextSummary;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Privire de ansamblu asupra finanțelor tale</p>
      </div>

      <div className="flex gap-3 bg-white p-2 rounded-lg border border-gray-200 w-fit">
        <button
          onClick={() => setSelectedMonth('current')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedMonth === 'current'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Luna curentă</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedMonth('next')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedMonth === 'next'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>Luna viitoare</span>
          </div>
        </button>
      </div>

      {activeSummary && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <span className="text-lg font-medium">Venituri Totale</span>
              </div>
              <div className="text-4xl font-bold">{formatRON(activeSummary.totalIncome)}</div>
              <div className="text-sm mt-2 opacity-90">{activeSummary.incomes.length} surse</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-8 h-8" />
                <span className="text-lg font-medium">Datorii Totale</span>
              </div>
              <div className="text-4xl font-bold">{formatRON(activeSummary.totalDebts)}</div>
              <div className="text-sm mt-2 opacity-90">{activeSummary.debts.length} datorii</div>
            </div>

            <div className={`rounded-xl p-6 text-white shadow-lg ${
              activeSummary.remaining >= 0
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                : 'bg-gradient-to-br from-orange-500 to-red-600'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-8 h-8" />
                <span className="text-lg font-medium">Disponibil</span>
              </div>
              <div className="text-4xl font-bold">{formatRON(activeSummary.remaining)}</div>
              <div className="text-sm mt-2 opacity-90">
                {activeSummary.remaining >= 0 ? 'Surplus' : 'Deficit'}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Venituri în {selectedMonth === 'current' ? 'luna curentă' : 'luna viitoare'}
              </h3>
              {activeSummary.incomes.length > 0 ? (
                <div className="space-y-3">
                  {activeSummary.incomes.map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <div className="font-semibold text-gray-900">{income.description}</div>
                        <div className="text-sm text-gray-600">{new Date(income.date).toLocaleDateString('ro-RO')}</div>
                      </div>
                      <div className="text-lg font-bold text-green-600">{formatRON(income.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Niciun venit înregistrat</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-red-600" />
                Datorii în {selectedMonth === 'current' ? 'luna curentă' : 'luna viitoare'}
              </h3>
              {activeSummary.debts.length > 0 ? (
                <div className="space-y-3">
                  {activeSummary.debts.map((debt) => (
                    <div key={debt.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <div className="font-semibold text-gray-900">{debt.name}</div>
                        <div className="text-sm text-gray-600">
                          Scadență: {new Date(debt.due_date).toLocaleDateString('ro-RO')}
                        </div>
                        <div className="text-xs text-gray-500 capitalize mt-1">{debt.category}</div>
                      </div>
                      <div className="text-lg font-bold text-red-600">{formatRON(debt.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nicio datorie înregistrată</p>
              )}
            </div>
          </div>

          {activeSummary.remaining < 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900">Atenție: Deficit bugetar</h4>
                  <p className="text-orange-800 text-sm mt-1">
                    Datoriile tale depășesc veniturile cu {formatRON(Math.abs(activeSummary.remaining))}.
                    Ia în considerare reducerea cheltuielilor sau creșterea veniturilor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
