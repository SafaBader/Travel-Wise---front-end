import { Heart, MapPin, Clock, Star, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';

export default function PlaceCard({ place, showFavorite = true }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const fav = isFavorite(place.id);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/places/${place.id}` } });
      return;
    }
    toggleFavorite(place.id);
  };

  return (
    <Link to={`/places/${place.id}`} className="group block">
      <section className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <section className="relative overflow-hidden aspect-[4/3]">
          <img
            src={place.images?.[0] || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg'}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <section className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {place.featured && (
            <section className="absolute top-3 left-3">
              <span className="bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Featured
              </span>
            </section>
          )}

          {showFavorite && (
            <button
              onClick={handleFav}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                user && fav
                  ? 'bg-red-500 text-white shadow-lg scale-110'
                  : 'bg-white/90 text-neutral-500 hover:bg-white hover:text-red-500 shadow'
              }`}
              title={user ? (fav ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to save'}
            >
              <Heart className={`w-4 h-4 ${user && fav ? 'fill-white' : ''}`} />
            </button>
          )}

          <section className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <section className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white text-xs font-semibold">{Number(place.rating).toFixed(1)}</span>
            </section>
            {place.review_count > 0 && (
              <section className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                <MessageSquare className="w-3 h-3 text-white/80" />
                <span className="text-white/90 text-xs">{place.review_count}</span>
              </section>
            )}
          </section>
        </section>

        <section className="p-4">
          <section className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
              {place.name}
            </h3>
            {place.category && (
              <span className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium shrink-0">
                {place.category.name}
              </span>
            )}
          </section>

          <section className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{place.location}, {place.country}</span>
          </section>

          {place.estimated_duration && (
            <section className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{place.estimated_duration}</span>
            </section>
          )}
        </section>
      </section>
    </Link>
  );
}
