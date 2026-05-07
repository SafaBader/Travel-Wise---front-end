import { useState, useEffect } from 'react';
import { api, normalizePlace } from '../lib/api';

function filterPlaces(places, filters) {
  return places.filter((place) => {
    const text = `${place.name} ${place.location} ${place.country} ${place.category?.name || ''}`.toLowerCase();
    if (filters?.search && !text.includes(filters.search.toLowerCase())) return false;
    if (filters?.categoryId && place.category_id !== filters.categoryId) return false;
    if (filters?.country && place.country !== filters.country) return false;
    if (filters?.minRating && Number(place.rating) < Number(filters.minRating)) return false;
    return true;
  });
}

export function usePlaces(filters) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/places')
      .then((data) => {
        if (cancelled) return;
        const normalized = (Array.isArray(data) ? data : data?.places || []).map(normalizePlace);
        setPlaces(filterPlaces(normalized, filters));
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters?.search, filters?.categoryId, filters?.country, filters?.minRating, filters?.featured]);

  return { places, loading, error };
}

export function usePlace(id) {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/places/${id}`)
      .then((data) => setPlace(normalizePlace(data.place || data)))
      .finally(() => setLoading(false));
  }, [id]);

  return { place, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/places')
      .then((data) => {
        const places = (Array.isArray(data) ? data : data?.places || []).map(normalizePlace);
        const unique = [...new Set(places.map(p => p.category?.name).filter(Boolean))];
        setCategories(unique.map(name => ({ id: name, name })));
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
