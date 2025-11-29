import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const linkBase =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition';
  const linkInactive = 'text-gray-600 hover:bg-gray-100';
  const linkActive =
    'bg-blue-50 text-blue-700 border-b-2 border-blue-600';

  const navLinks = (
    <>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/incomes"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        Venituri
      </NavLink>
      <NavLink
        to="/debts"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        Datorii
      </NavLink>
      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        Istoric
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">
              Budget Manager
            </span>
          </div>

          {/* Desktop nav + user */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-2">
              {navLinks}
            </nav>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Ieșire
              </button>
            </div>
          </div>

          {/* Mobile: user + burger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <span className="text-xs text-gray-600 max-w-[120px] truncate text-right">
                {user.email}
              </span>
            )}
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              aria-label="Deschide meniul"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
              <nav className="flex flex-col gap-1">{navLinks}</nav>
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  logout();
                }}
                className="mt-2 w-full text-left text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium"
              >
                Ieșire
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
