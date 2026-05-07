import { useState, useEffect, useCallback } from 'react';
import { api, apiRequest, normalizePlace } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await api.get('/favourites');
      const rows = (Array.isArray(data) ? data : []).map(f => ({
        ...f,
        id: f.id || f._id,
        place_id: f.place?._id || f.place?.id || f.place,
        place: normalizePlace(f.place),
      }));
      setFavorites(rows);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const addFavorite = async (placeId) => {
    if (!user) return;
    const f = await api.post('/favourites', { placeId });
    const row = { ...f, id: f.id || f._id, place_id: f.place?._id || f.place?.id || f.place, place: normalizePlace(f.place) };
    setFavorites(prev => [row, ...prev]);
  };

  const removeFavorite = async (placeId) => {
    if (!user) return;
    await apiRequest('/favourites', { method: 'DELETE', body: JSON.stringify({ placeId }) });
    setFavorites(prev => prev.filter(f => f.place_id !== placeId));
  };

  const isFavorite = (placeId) => favorites.some(f => f.place_id === placeId);

  const toggleFavorite = async (placeId) => {
    if (isFavorite(placeId)) await removeFavorite(placeId);
    else await addFavorite(placeId);
  };

  return { favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
}
