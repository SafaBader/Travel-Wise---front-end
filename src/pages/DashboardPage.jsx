import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map, Heart, Star, Calendar, ArrowRight, Plus,
  TrendingUp, Clock, CheckCircle, Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { useFavorites } from '../hooks/useFavorites';
import { format } from '../utils/date';

const STATUS_CONFIG = {
  planning: { label: 'Planning', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Clock },
  upcoming: { label: 'Upcoming', class: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400', icon: Calendar },
  ongoing: { label: 'Ongoing', class: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400', icon: TrendingUp },
  completed: { label: 'Completed', class: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400', icon: CheckCircle },
};

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { trips } = useTrips();
  const { favorites } = useFavorites();
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    setReviewCount(0);
  }, [user]);

  const upcoming = trips.filter(t => t.status === 'upcoming' || t.status === 'ongoing');
  const recent = trips.slice(0, 5);

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: Map, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
    { label: 'Favorites', value: favorites.length, icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'Reviews', value: reviewCount, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-secondary-600 dark:text-secondary-400', bg: 'bg-secondary-50 dark:bg-secondary-900/30' },
  ];

  const tripStatusBreakdown = Object.entries(STATUS_CONFIG).map(([status, cfg]) => ({
    status,
    ...cfg,
    count: trips.filter(t => t.status === status).length,
  }));

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 dark:from-neutral-900 dark:to-neutral-900 py-14 relative overflow-hidden">
        <section className="absolute inset-0 opacity-5 dark:opacity-10">
          <Compass className="absolute right-10 top-5 w-72 h-72 text-white" />
        </section>
        <section className="page-container relative">
          <p className="text-primary-200 dark:text-neutral-500 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            {profile?.full_name || profile?.name || 'Traveler'}
          </h1>
          <p className="text-primary-200 dark:text-neutral-400">Here's an overview of your travel journey</p>
        </section>
      </section>

      <section className="page-container py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <section key={label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 flex items-center gap-4 shadow-sm">
              <section className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </section>
              <section>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
              </section>
            </section>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent trips */}
          <section className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm">
            <section className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">Recent Trips</h2>
              <Link to="/trips" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>

            {recent.length === 0 ? (
              <section className="text-center py-10">
                <Map className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">No trips yet</p>
                <Link to="/trips" className="btn-primary text-sm flex items-center gap-1.5 mx-auto w-fit">
                  <Plus className="w-4 h-4" /> Create Trip
                </Link>
              </section>
            ) : (
              <section className="space-y-2">
                {recent.map(trip => {
                  const cfg = STATUS_CONFIG[trip.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                    >
                      <section className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={trip.cover_image || 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </section>
                      <section className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{trip.title}</p>
                        <section className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${cfg.class}`}>
                            <StatusIcon className="w-2.5 h-2.5 mr-1" />
                            {cfg.label}
                          </span>
                          {trip.start_date && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">{format(trip.start_date)}</span>
                          )}
                        </section>
                      </section>
                      <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 transition-all" />
                    </Link>
                  );
                })}
              </section>
            )}
          </section>

          <section className="space-y-5">
            {/* Trip Status */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Trip Status</h3>
              <section className="space-y-3">
                {tripStatusBreakdown.map(({ status, label, class: cls, icon: Icon, count }) => (
                  <section key={status} className="flex items-center gap-3">
                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium w-24 justify-center ${cls}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {label}
                    </span>
                    <section className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                      <section
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: trips.length ? `${(count / trips.length) * 100}%` : '0%' }}
                      />
                    </section>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 w-5 text-right">{count}</span>
                  </section>
                ))}
              </section>
            </section>

            {/* Quick Actions */}
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h3>
              <section className="space-y-2">
                {[
                  { to: '/explore', icon: Compass, label: 'Explore Destinations', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' },
                  { to: '/trips', icon: Plus, label: 'Plan a New Trip', color: 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400' },
                  { to: '/favorites', icon: Heart, label: 'View Favorites', color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                  >
                    <section className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </section>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 ml-auto group-hover:text-primary-400 transition-all" />
                  </Link>
                ))}
              </section>
            </section>

            {/* Saved places */}
            {favorites.length > 0 && (
              <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
                <section className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Saved Places</h3>
                  <Link to="/favorites" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">See all</Link>
                </section>
                <section className="grid grid-cols-3 gap-2">
                  {favorites.slice(0, 6).map(fav => fav.place && (
                    <Link key={fav.id} to={`/places/${fav.place_id}`} className="group">
                      <section className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={fav.place.images[0]}
                          alt={fav.place.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </section>
                    </Link>
                  ))}
                </section>
              </section>
            )}
          </section>
        </section>
      </section>
    </section>
  );
}
