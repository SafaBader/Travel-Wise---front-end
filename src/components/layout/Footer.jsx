import { Link } from 'react-router-dom';
import { Compass, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 dark:bg-neutral-950 text-neutral-400 mt-16 border-t border-neutral-800">
      <section className="page-container py-12">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <section className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <section className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </section>
              <span className="font-display font-bold text-xl text-white">
                Travel<span className="text-primary-400">Wise</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-neutral-400">
              Your intelligent travel companion. Discover destinations, plan perfect itineraries, and create unforgettable memories.
            </p>
            <section className="flex gap-3 mt-5">
              {[Twitter, Instagram, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-neutral-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-neutral-300" />
                </button>
              ))}
            </section>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Destinations', '/explore']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-neutral-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Plan</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Planner', '/planner'], ['My Trips', '/trips'], ['Favorites', '/favorites'], ['Dashboard', '/dashboard']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-neutral-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} TravelWise. All rights reserved.</p>
          <section className="flex gap-5">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
          </section>
        </section>
      </section>
    </footer>
  );
}
