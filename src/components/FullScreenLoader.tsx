// src/components/FullScreenLoader.tsx
import { useLocation } from 'react-router-dom';

export default function FullScreenLoader() {
  const { pathname } = useLocation();

  // texte diferite în funcție de pagină
  const getTexts = () => {
    if (pathname.startsWith('/login')) {
      return {
        title: 'Se încarcă…',
        subtitle: 'Te conectăm la contul tău.',
      };
    }
    if (pathname.startsWith('/register')) {
      return {
        title: 'Se încarcă…',
        subtitle: 'Pregătim formularul de înregistrare.',
      };
    }
    if (pathname.startsWith('/incomes')) {
      return {
        title: 'Se încarcă…',
        subtitle: 'Îți încărcăm veniturile înregistrate.',
      };
    }
    if (pathname.startsWith('/debts')) {
      return {
        title: 'Se încarcă…',
        subtitle: 'Îți pregătim lista de datorii.',
      };
    }
    if (pathname.startsWith('/transactions')) {
      return {
        title: 'Se încarcă…',
        subtitle: 'Îți încărcăm istoricul tranzacțiilor.',
      };
    }

    // dashboard / root / orice altceva
    return {
      title: 'Se încarcă…',
      subtitle: 'Îți pregătim dashboard-ul tău.',
    };
  };

  const { title, subtitle } = getTexts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-100 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-gray-100 px-8 py-7 w-full max-w-sm">
        {/* header mic cu brand */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            B
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Budget Manager</p>
            <p className="text-xs text-gray-500">Aplicația ta de buget personal</p>
          </div>
        </div>

        {/* animație + texte dinamice */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            {/* cerc exterior pulsant */}
            <div className="w-16 h-16 rounded-full bg-blue-100 animate-ping-slow" />
            {/* spinner principal */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
            </div>
          </div>

          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
