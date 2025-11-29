import { useState, useEffect } from 'react';
import { Summary } from '../types';
import { api } from '../lib/api';
import {
  TrendingUp,
  CreditCard,
  Wallet,
  Calendar,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { formatRON } from '../utils/format-number';
import FullScreenLoader from '../components/FullScreenLoader';

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

  const getMonthLabel = (summary: Summary | null) => {
    if (!summary?.month) return '';
    // backend trimite "YYYY-MM"
    const [year, month] = summary.month.split('-').map(Number);
    if (!year || !month) return summary.month;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('ro-RO', {
      month: 'long',
      year: 'numeric',
    });
  };

  const monthLabel = getMonthLabel(activeSummary);

  const savingsRate =
    activeSummary && activeSummary.totalIncome > 0
      ? (activeSummary.remaining / activeSummary.totalIncome) * 100
      : 0;

  const coverage =
    activeSummary && activeSummary.totalDebts > 0
      ? (activeSummary.totalIncome / activeSummary.totalDebts) * 100
      : 0;

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Privire de ansamblu asupra finanțelor tale personale
          </p>
        </div>

        {/* Selector lună */}
        <div className="flex flex-col items-end gap-2">
          {monthLabel && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
              <Calendar className="w-3 h-3" />
              <span>{monthLabel}</span>
            </span>
          )}

          <div className="flex gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
            <button
              onClick={() => setSelectedMonth('current')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                selectedMonth === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Luna curentă</span>
            </button>
            <button
              onClick={() => setSelectedMonth('next')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                selectedMonth === 'next'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Luna viitoare</span>
            </button>
          </div>
        </div>
      </div>

      {!activeSummary ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-700 font-medium">
            Nu există încă date pentru luna selectată.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Adaugă veniturile și datoriile tale pentru a vedea statistici aici.
          </p>
        </div>
      ) : (
        <>
          {/* Carduri principale */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Venituri totale */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_55%)]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-xl bg-white/15 p-2">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wide text-white/80">
                    Venituri totale
                  </span>
                </div>
                <div className="text-3xl font-bold leading-tight">
                  {formatRON(activeSummary.totalIncome)}
                </div>
                <div className="text-xs mt-2 text-white/80">
                  {activeSummary.incomes.length} surse de venit
                </div>
              </div>
            </div>

            {/* Datorii totale */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_bottom,_#ffffff40,_transparent_55%)]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-xl bg-white/15 p-2">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wide text-white/80">
                    Datorii totale
                  </span>
                </div>
                <div className="text-3xl font-bold leading-tight">
                  {formatRON(activeSummary.totalDebts)}
                </div>
                <div className="text-xs mt-2 text-white/80">
                  {activeSummary.debts.length} datorii active
                </div>
              </div>
            </div>

            {/* Disponibil */}
            <div
              className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${
                activeSummary.remaining >= 0
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                  : 'bg-gradient-to-br from-orange-500 to-red-600'
              }`}
            >
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_left,_#ffffff40,_transparent_60%)]" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-xl bg-white/15 p-2">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wide text-white/80">
                    Disponibil
                  </span>
                </div>
                <div className="text-3xl font-bold leading-tight">
                  {formatRON(activeSummary.remaining)}
                </div>
                <div className="text-xs mt-2 text-white/80">
                  {activeSummary.remaining >= 0 ? 'Surplus bugetar' : 'Deficit bugetar'}
                </div>
              </div>
            </div>

            {/* Rata de economisire / acoperire */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Percent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Indicatori buget
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rată economisire</span>
                    <span
                      className={`font-semibold ${
                        savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        savingsRate >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, Math.abs(savingsRate))
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mt-3">
                    <span className="text-gray-600">Acoperire datorii</span>
                    <span className="font-semibold text-blue-600">
                      {coverage > 0 ? `${coverage.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Ideal este să ai un surplus pozitiv și o acoperire a datoriilor
                peste 100%.
              </p>
            </div>
          </div>

          {/* Liste venituri / datorii */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Venituri */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="w-4 h-4 text-green-700" />
                  </span>
                  Venituri în{' '}
                  {selectedMonth === 'current' ? 'luna curentă' : 'luna viitoare'}
                </h3>
                <span className="text-xs text-gray-500">
                  {activeSummary.incomes.length} înregistrări
                </span>
              </div>

              {activeSummary.incomes.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {activeSummary.incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex justify-between items-center p-3 rounded-xl border border-green-50 bg-gradient-to-r from-green-50 to-white hover:from-green-100/60 hover:border-green-200 transition"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {income.description || 'Venit fără descriere'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(income.date).toLocaleDateString('ro-RO')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-700">
                          {formatRON(income.amount)}
                        </div>
                        {income.is_recurring && (
                          <div className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Recurent
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  Niciun venit înregistrat pentru această lună.
                </p>
              )}
            </div>

            {/* Datorii */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <CreditCard className="w-4 h-4 text-red-700" />
                  </span>
                  Datorii în{' '}
                  {selectedMonth === 'current' ? 'luna curentă' : 'luna viitoare'}
                </h3>
                <span className="text-xs text-gray-500">
                  {activeSummary.debts.length} înregistrări
                </span>
              </div>

              {activeSummary.debts.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {activeSummary.debts.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex justify-between items-center p-3 rounded-xl border border-red-50 bg-gradient-to-r from-red-50 to-white hover:from-red-100/60 hover:border-red-200 transition"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {debt.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Scadență:{' '}
                          {new Date(debt.due_date).toLocaleDateString('ro-RO')}
                        </div>
                        {debt.category && (
                          <div className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-1 capitalize">
                            {debt.category}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-700">
                          {formatRON(debt.amount)}
                        </div>
                        {debt.is_recurring && (
                          <div className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Recurent
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  Nicio datorie înregistrată pentru această lună.
                </p>
              )}
            </div>
          </div>

          {activeSummary.remaining < 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900">
                    Atenție: deficit bugetar
                  </h4>
                  <p className="text-orange-800 text-sm mt-1">
                    Datoriile tale depășesc veniturile cu{' '}
                    {formatRON(Math.abs(activeSummary.remaining))}. Ia în
                    considerare reducerea cheltuielilor sau creșterea
                    veniturilor.
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
