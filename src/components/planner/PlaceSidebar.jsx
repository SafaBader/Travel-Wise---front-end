import { useState } from 'react';
import { Globe, Heart, Search } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { usePlaces, useCategories } from '../../hooks/usePlaces';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DraggablePlaceItem from './DraggablePlaceItem';

export default function PlaceSidebar({ trip, days, onAddToDay }) {
    const { favorites } = useFavorites();
    const [tab, setTab] = useState('favorites');
    const [browseOpen, setBrowseOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const { places: allPlaces, loading: placesLoading } = usePlaces({ search: search || undefined, categoryId: catFilter || undefined });
    const { categories } = useCategories();

    // Filter favorites automatically by selected trip destination (city, country, or destination text).
    const destination = (trip?.destination || trip?.destination_city || trip?.destination_country || '').trim().toLowerCase();
    const favPlaces = favorites
        .filter(f => f.place)
        .map(f => f.place)
        .filter(p => {
            if (!destination) return true;
            return [p.city, p.country, p.location, p.name, p.title].filter(Boolean).some(v => String(v).toLowerCase().includes(destination));
        });

    const placesToShow = tab === 'favorites' ? favPlaces : allPlaces.slice(0, 30);

    return (
        <section className="w-80 shrink-0">
            <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm sticky top-36 overflow-hidden">
                <section className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                    <section className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Favorite Places</h3>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">Drag to a day</span>
                    </section>

                    {/* Tab switcher */}
                    <section className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                        <button
                            onClick={() => setTab('favorites')}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${tab === 'favorites'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <Heart className="w-3.5 h-3.5" />
                            Favorites
                        </button>
                        <button
                            onClick={() => { setTab('browse'); setBrowseOpen(true); }}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${tab === 'browse'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            Browse More Places
                        </button>
                    </section>

                    {tab === 'browse' && (
                        <section className="mt-3 space-y-2">
                            <section className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <input
                                    type="text"
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
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </section>
                    )}
                </section>

                <section className="overflow-y-auto max-h-[55vh] p-2">
                    {tab === 'favorites' && favPlaces.length === 0 ? (
                        <section className="text-center py-8">
                            <Heart className="w-8 h-8 text-neutral-200 dark:text-neutral-700 mx-auto mb-2" />
                            <p className="text-neutral-400 dark:text-neutral-500 text-xs">No favorites yet</p>
                            <button
                                onClick={() => setTab('browse')}
                                className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                            >
                                Browse More Places
                            </button>
                        </section>
                    ) : tab === 'browse' && placesLoading ? (
                        <section className="flex justify-center py-8"><LoadingSpinner /></section>
                    ) : placesToShow.length === 0 ? (
                        <section className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">No places found</section>
                    ) : (
                        <section className="space-y-1">
                            {placesToShow.map(place => (
                                <DraggablePlaceItem key={place.id} place={place} days={days} onAddToDay={onAddToDay} />
                            ))}
                        </section>
                    )}
                </section>
            </section>
        </section>
    );
}

