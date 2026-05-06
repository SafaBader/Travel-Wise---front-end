import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass, Heart, Map, LayoutDashboard, Moon, Sun,
  Menu, X, ChevronDown, LogOut, User, Shield, Home, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ALL_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, protected: false },
  { to: '/explore', label: 'Explore', icon: Compass, protected: false },
  {
    to: '/favorites', label: 'Favorites', icon: Heart, protected: true,
    description: 'Save your dream destinations and access them anytime.',
  },
  {
    to: '/trips', label: 'My Trips', icon: Map, protected: true,
    description: 'Plan multi-day itineraries with drag-and-drop ease.',
  },
  {
    to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true,
    description: 'Track your travel history and upcoming adventures.',
  },
  {
    to: '/profile', label: 'Profile', icon: User, protected: true,
    description: 'Manage your account settings and preferences.',
  },
];

function GuestPopover({ item, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <section
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-4 z-50 animate-scale-in"
    >
      <section className="flex items-center gap-2.5 mb-2">
        <section className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
          <item.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </section>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{item.label}</p>
      </section>
      <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">{item.description}</p>
      <section className="flex gap-2">
        <Link
          to="/register"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Sign Up Free
        </Link>
        <Link
          to="/login"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </Link>
      </section>
    </section>
  );
}

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleNavClick = (e, item) => {
    if (item.protected && !user) {
      e.preventDefault();
      setActivePopover(activePopover === item.to ? null : item.to);
    } else {
      setActivePopover(null);
    }
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
      <section className="page-container">
        <section className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <section className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Compass className="w-5 h-5 text-white" />
            </section>
            <span className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
              Travel<span className="text-primary-600">Wise</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <section className="hidden md:flex items-center gap-1">
            {ALL_NAV_ITEMS.map((item) => {
              const locked = item.protected && !user;
              return (
                <section key={item.to} className="relative">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={(e) => handleNavClick(e, item)}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        locked
                          ? 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer'
                          : isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                  {locked && activePopover === item.to && (
                    <GuestPopover item={item} onClose={() => setActivePopover(null)} />
                  )}
                </section>
              );
            })}
          </section>

          <section className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-xl text-neutral-600 dark:text-neutral-400"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <section className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <section className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-700 dark:text-primary-400 font-semibold text-sm">
                        {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </section>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <section className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <section className="absolute right-0 top-12 z-20 w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 py-1.5 animate-scale-in">
                      <section className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                        <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                      </section>
                      {[
                        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/profile', icon: User, label: 'Profile' },
                        ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                          {label}
                        </Link>
                      ))}
                      <hr className="my-1 border-neutral-100 dark:border-neutral-800" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </section>
                  </>
                )}
              </section>
            ) : (
              <section className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </section>
            )}

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden btn-ghost p-2 rounded-xl"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </section>
        </section>

        {/* Mobile menu */}
        {menuOpen && (
          <section className="md:hidden border-t border-neutral-100 dark:border-neutral-800 py-3 space-y-1 animate-slide-down">
            {ALL_NAV_ITEMS.map((item) => {
              const locked = item.protected && !user;
              return (
                <section key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        setActivePopover(activePopover === item.to ? null : item.to);
                      } else {
                        setMenuOpen(false);
                        setActivePopover(null);
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        locked
                          ? 'text-neutral-400 dark:text-neutral-500'
                          : isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                  {locked && activePopover === item.to && (
                    <section className="mx-4 mb-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{item.description}</p>
                      <section className="flex gap-2">
                        <Link
                          to="/register"
                          onClick={() => { setMenuOpen(false); setActivePopover(null); }}
                          className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Sign Up Free
                        </Link>
                        <Link
                          to="/login"
                          onClick={() => { setMenuOpen(false); setActivePopover(null); }}
                          className="flex-1 text-center py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Sign In
                        </Link>
                      </section>
                    </section>
                  )}
                </section>
              );
            })}
            {!user && (
              <section className="flex gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-sm text-center">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-sm text-center">Get Started</Link>
              </section>
            )}
          </section>
        )}
      </section>
    </nav>
  );
}
