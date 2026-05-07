import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, MapPin, Users, Compass, Zap, Clock, ChevronRight, Mountain, Layers } from 'lucide-react';
import { usePlaces, useCategories } from '../hooks/usePlaces';
import PlaceCard from '../components/places/PlaceCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORY_ICON_MAP = {
  beach: '🏖️',
  mountain: '⛰️',
  cultural: '🏛️',
  history: '🏰',
  island: '🏝️',
  food: '🍜',
  nature: '🌿',
  shopping: '🛍️',
};

function getCategoryIcon(name) {
  if (!name) return '🌍';
  const key = String(name).toLowerCase();
  if (CATEGORY_ICON_MAP[key]) return CATEGORY_ICON_MAP[key];
  const tokens = key.split(/[^a-z0-9]+/);
  for (const token of tokens) {
    if (CATEGORY_ICON_MAP[token]) return CATEGORY_ICON_MAP[token];
  }
  const match = Object.entries(CATEGORY_ICON_MAP).find(([category]) => key.includes(category));
  return match ? match[1] : '🌍';
}

const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  Moderate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  Challenging: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
};

const DIFFICULTY_DOT = {
  Beginner: 'bg-emerald-500',
  Moderate: 'bg-amber-500',
  Challenging: 'bg-red-500',
};

const stats = [
  { label: 'Destinations', value: '200+', icon: MapPin },
  { label: 'Happy Travelers', value: '50K+', icon: Users },
  { label: 'Expert Reviews', value: '10K+', icon: Star },
  { label: 'Countries', value: '80+', icon: Compass },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedPlans, setSuggestedPlans] = useState([]);
  const navigate = useNavigate();
  const { places: featured } = usePlaces({ featured: true });
  const { categories } = useCategories();

  useEffect(() => {
    setSuggestedPlans([]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <section className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg"
            alt="Travel hero"
            className="w-full h-full object-cover"
          />
          <section className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-900/65 to-neutral-900/30" />
        </section>

        <section className="relative z-10 page-container py-20">
          <section className="max-w-2xl">
            <section className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
                <Zap className="w-3 h-3" />
              Smart Travel Planning
              </span>
            </section>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover Your
              <span className="text-primary-400"> Perfect</span> Journey
            </h1>

            <p className="text-xl text-neutral-300 mb-10 leading-relaxed max-w-xl">
              Explore breathtaking destinations, plan detailed itineraries, and create unforgettable travel memories.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <section className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, countries..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/95 backdrop-blur text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base shadow-2xl"
                />
              </section>
              <button type="submit" className="btn-primary px-6 py-4 rounded-2xl text-base font-semibold shadow-2xl">
                Search
              </button>
            </form>

            <section className="flex flex-wrap gap-2 mt-4">
              {['Bali', 'Japan', 'Greece', 'Iceland', 'Peru'].map(dest => (
                <button
                  key={dest}
                  onClick={() => navigate(`/explore?q=${dest}`)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-sm rounded-full border border-white/20 transition-all"
                >
                  {dest}
                </button>
              ))}
            </section>
          </section>
        </section>

        {/* Stats bar */}
        <section className="absolute bottom-0 left-0 right-0 z-10">
          <section className="page-container">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-t-3xl overflow-hidden">
              {stats.map(({ label, value, icon: Icon }) => (
                <section key={label} className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-6 py-5 flex items-center gap-4">
                  <section className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </section>
                  <section>
                    <p className="font-bold text-xl text-neutral-900 dark:text-neutral-100">{value}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                  </section>
                </section>
              ))}
            </section>
          </section>
        </section>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <section className="page-container">
          <section className="text-center mb-12">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle">Find your perfect travel style</p>
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="group flex flex-col items-center p-4 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-center"
              >
                <span className="text-3xl mb-2">{getCategoryIcon(cat.name)}</span>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">{cat.name}</span>
              </Link>
            ))}
          </section>
        </section>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <section className="page-container">
          <section className="flex items-end justify-between mb-10">
            <section>
              <h2 className="section-title">Featured Destinations</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Handpicked experiences for the discerning traveler</p>
            </section>
            <Link
              to="/explore"
              className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {featured.length === 0 ? (
            <section className="flex justify-center py-12"><LoadingSpinner /></section>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.slice(0, 8).map(place => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </section>
          )}

          <section className="text-center mt-10">
            <Link to="/explore" className="btn-secondary">
              Explore All Destinations
            </Link>
          </section>
        </section>
      </section>

      {/* Suggested Plans */}
      {suggestedPlans.length > 0 && (
        <section className="py-20 bg-white dark:bg-neutral-900">
          <section className="page-container">
            <section className="flex items-end justify-between mb-10">
              <section>
                <h2 className="section-title">Suggested Itineraries</h2>
                <p className="text-neutral-500 dark:text-neutral-400">Expertly crafted plans ready for your next adventure</p>
              </section>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedPlans.map(plan => (
                <section
                  key={plan.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
                >
                  <section className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                    {plan.image_url ? (
                      <img
                        src={plan.image_url}
                        alt={plan.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <section className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 dark:from-primary-900/40 to-primary-100 dark:to-primary-900/20">
                        <Mountain className="w-16 h-16 text-primary-200 dark:text-primary-700" />
                      </section>
                    )}
                    <section className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <section className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      {plan.difficulty && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${DIFFICULTY_STYLES[plan.difficulty] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[plan.difficulty] || 'bg-neutral-400'}`} />
                          {plan.difficulty}
                        </span>
                      )}
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur text-white text-xs font-medium rounded-full ml-auto">
                        <Clock className="w-3 h-3" />
                        {plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}
                      </span>
                    </section>
                  </section>

                  <section className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                      {plan.title}
                    </h3>
                    {plan.description && (
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    {plan.highlights && plan.highlights.length > 0 && (
                      <section className="mt-auto">
                        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> Highlights
                        </p>
                        <ul className="space-y-1">
                          {plan.highlights.slice(0, 3).map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                              <ChevronRight className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {plan.tags && plan.tags.length > 0 && (
                      <section className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                        {plan.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </section>
                    )}
                  </section>
                </section>
              ))}
            </section>
          </section>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-900 dark:to-neutral-950 relative overflow-hidden">
        <section className="absolute inset-0 opacity-10">
          <section className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full -translate-y-1/2 blur-3xl" />
          <section className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full translate-y-1/2 blur-3xl" />
        </section>
        <section className="relative page-container text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-xl mx-auto">
            Join thousands of travelers planning their dream trips with TravelWise.
          </p>
          <section className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors shadow-xl">
              Start Planning Free
            </Link>
            <Link to="/explore" className="px-8 py-4 bg-primary-600/50 text-white font-semibold rounded-2xl hover:bg-primary-600 transition-colors border border-primary-500">
              Browse Destinations
            </Link>
          </section>
        </section>
      </section>
    </section>
  );
}
