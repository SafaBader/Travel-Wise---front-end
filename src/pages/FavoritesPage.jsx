import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import PlaceCard from '../components/places/PlaceCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function FavoritesPage() {
    const { favorites, loading } = useFavorites();

    return (
        <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10">
                <section className="page-container">
                    <section className="flex items-center gap-3 mb-1">
                        <section className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </section>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Favorites</h1>
                    </section>
                    <p className="text-neutral-500 dark:text-neutral-400 ml-[52px]">
                        {loading ? '...' : `${favorites.length} saved place${favorites.length !== 1 ? 's' : ''}`}
                    </p>
                </section>
            </section>

            <section className="page-container py-10">
                {loading ? (
                    <section className="flex justify-center py-24"><LoadingSpinner size="lg" /></section>
                ) : favorites.length === 0 ? (
                    <section className="text-center py-24">
                        <section className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Heart className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                        </section>
                        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No favorites yet</h3>
                        <p className="text-neutral-400 dark:text-neutral-500 mb-6">Start exploring and save places you love</p>
                        <Link to="/explore" className="btn-primary">Explore Destinations</Link>
                    </section>
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map(fav => fav.place && (
                            <PlaceCard key={fav.id} place={fav.place} showFavorite />
                        ))}
                    </section>
                )}
            </section>
        </section>
    );
}
