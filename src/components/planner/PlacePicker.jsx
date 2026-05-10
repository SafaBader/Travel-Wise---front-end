import { useState } from 'react';
import { Globe, Heart, Search } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { usePlaces, useCategories } from '../../hooks/usePlaces';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PlaceItem from './PlaceItem';

export default function PlacePicker({ destination, days, onAddPlace }) {
  const { favorites } = useFavorites();
  const { categories } = useCategories();
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const { places: allPlaces, loading: placesLoading } = usePlaces({
    search: search || undefined,
    categoryId: catFilter || undefined,
  });

  const destinationText = destination.trim().toLowerCase();
  const favoritePlaces = favorites
    .filter(f => f.place)
    .map(f => f.place)
    .filter(place => {
      if (!destinationText) return true;
      return [place.city, place.country, place.location, place.name, place.title]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(destinationText));
    });

  const placesToShow = tab === 'favorites' ? favoritePlaces : allPlaces.slice(0, 30);

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm lg:sticky lg:top-24 overflow-hidden">
        <section className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <section className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Places</h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">Drag to a day</span>
          </section>

          <section className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setTab('browse')}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === 'browse' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Browse
            </button>
            <button
              type="button"
              onClick={() => setTab('favorites')}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                tab === 'favorites' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </button>
          </section>

          {tab === 'browse' && (
            <section className="mt-3 space-y-2">
              <section className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search places..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </section>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">All Categories</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </section>
          )}
        </section>

        <section className="overflow-y-auto max-h-[60vh] p-2">
          {placesLoading && tab === 'browse' ? (
            <section className="flex justify-center py-8"><LoadingSpinner /></section>
          ) : placesToShow.length === 0 ? (
            <section className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">No places found</section>
          ) : (
            <section className="space-y-1">
              {placesToShow.map(place => (
                <PlaceItem key={place.id} place={place} days={days} onAddPlace={onAddPlace} />
              ))}
            </section>
          )}
        </section>
      </section>
    </aside>
  );
}

