import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Globe, Star } from 'lucide-react';
import { usePlaces, useCategories } from '../hooks/usePlaces';
import { useFavorites } from '../hooks/useFavorites';
import PlaceCard from '../components/places/PlaceCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RATING_OPTIONS = [
  { label: 'Any rating', value: '' },
  { label: '3+ stars', value: '3' },
  { label: '4+ stars', value: '4' },
  { label: '4.5+ stars', value: '4.5' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [minRating, setMinRating] = useState('');
  const [country, setCountry] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { categories } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { places: allPlaces } = usePlaces({});
  const { places, loading } = usePlaces({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    minRating: minRating ? Number(minRating) : undefined,
    country: country || undefined,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = {};
    if (search) params.q = search;
    if (categoryId) params.category = categoryId;
    setSearchParams(params, { replace: true });
  }, [search, categoryId]);

  const countries = [...new Set(allPlaces.map(p => p.country).filter(Boolean))].sort();

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setMinRating('');
    setCountry('');
  };

  const hasFilters = search || categoryId || minRating || country;
  const activeCategory = categories.find(c => c.id === categoryId);

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 dark:from-neutral-900 dark:via-primary-950 dark:to-neutral-900 py-14 relative overflow-hidden">
        <section className="absolute inset-0 opacity-10">
          <section className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl" />
          <section className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/3 translate-y-1/2 blur-3xl" />
        </section>

        <section className="page-container relative z-10">
          <section className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary-300" />
            <span className="text-primary-300 text-sm font-medium">
              {loading ? '...' : `${places.length} destination${places.length !== 1 ? 's' : ''}`}
            </span>
          </section>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            Explore Destinations
          </h1>

          <p className="text-primary-200 mb-8 text-lg">
            Discover amazing places from around the world
          </p>

          <section className="flex gap-3 max-w-2xl">
            <section className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />

              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search destinations, countries..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg text-base"
              />

              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </section>

            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${showFilters
                  ? 'bg-white dark:bg-neutral-800 text-primary-700 dark:text-primary-400'
                  : 'bg-primary-500 text-white hover:bg-primary-400'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />}
            </button>
          </section>

          {showFilters && (
            <section className="mt-4 flex flex-wrap gap-3 animate-slide-down">
              <section className="relative">
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-md cursor-pointer min-w-[160px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </section>

              <section className="relative">
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-md cursor-pointer min-w-[160px]"
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </section>

              <section className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 fill-amber-400 pointer-events-none" />
                <select
                  value={minRating}
                  onChange={e => setMinRating(e.target.value)}
                  className="appearance-none pl-9 pr-10 py-2.5 bg-white dark:bg-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-md cursor-pointer min-w-[140px]"
                >
                  {RATING_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </section>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </section>
          )}

          {hasFilters && !showFilters && (
            <section className="mt-3 flex flex-wrap gap-2">
              {activeCategory && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 text-white rounded-full font-medium">
                  {activeCategory.name}
                  <button onClick={() => setCategoryId('')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {country && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 text-white rounded-full font-medium">
                  {country}
                  <button onClick={() => setCountry('')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {minRating && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 text-white rounded-full font-medium">
                  {minRating}+ stars
                  <button onClick={() => setMinRating('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </section>
          )}
        </section>
      </section>

      <section className="page-container py-10">
        <section className="flex items-center justify-between mb-6">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {loading ? 'Searching...' : `${places.length} destination${places.length !== 1 ? 's' : ''} found`}
          </p>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Clear all filters
            </button>
          )}
        </section>

        {loading ? (
          <section className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </section>
        ) : places.length === 0 ? (
          <section className="text-center py-24">
            <section className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Globe className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
            </section>

            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              No destinations found
            </h3>

            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Try adjusting your search or filters
            </p>

            <button onClick={clearFilters} className="btn-primary">
              Clear filters
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                showFavorite
                isFavorite={isFavorite(place.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </section>
        )}
      </section>
    </section>
  );
}