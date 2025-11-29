import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email sau parolă incorectă');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid md:grid-cols-2">
          {/* Panou stânga – info / branding */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Budget Manager
                  </p>
                  <p className="text-sm text-white/80">
                    Administrează-ți bugetul inteligent
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-bold leading-tight mb-3">
                Bine ai revenit!
              </h1>
              <p className="text-sm text-white/85 mb-6">
                Autentifică-te pentru a vedea instant veniturile, datoriile și
                cât îți mai rămâne luna aceasta.
              </p>

              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>Dashboard clar cu situația pe luna curentă și viitoare.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>Istoric detaliat al tuturor plăților și tranzacțiilor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>
                    Datorii recurente și notificări vizuale pentru ce urmează.
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-white/70 mt-8">
              Conectarea se face securizat. Nu îți partajăm datele cu nimeni.
            </p>
          </div>

          {/* Panou dreapta – formular login */}
          <div className="p-7 md:p-8">

            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-500/30">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Conectează-te
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Introdu datele de autentificare pentru a-ți accesa panoul
                financiar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition"
                    placeholder="email@exemplu.ro"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Parolă
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm md:text-base transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Se conectează...' : 'Conectare'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                Nu ai cont?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
