import { useState, useEffect, useCallback } from 'react';
import { api, normalizePlace } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

function normalizeTrip(plan) {
  if (!plan) return plan;
  const id = plan.id || plan._id;
  return {
    ...plan,
    id,
    _id: id,
    title: plan.title || 'My Trip',
    destination: plan.destination || plan.destinationCity || plan.destinationCountry || '',
    destination_city: plan.destination_city || plan.destinationCity || '',
    destination_country: plan.destination_country || plan.destinationCountry || '',
    description: plan.description || '',
    start_date: (plan.start_date || plan.startDate || '').toString().slice(0, 10),
    end_date: (plan.end_date || plan.endDate || '').toString().slice(0, 10),
    cover_image: plan.cover_image || plan.coverImage || '',
    status: plan.status || 'planning',
    created_at: plan.createdAt || plan.created_at || plan.dateAdded,
    days: plan.days || [],
  };
}

const isMongoId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

function serializeTripPayload(trip) {
  return {
    title: trip.title,
    destination: trip.destination,
    description: trip.description,
    startDate: trip.start_date || trip.startDate,
    endDate: trip.end_date || trip.endDate,
    coverImage: trip.cover_image || trip.coverImage,
    status: trip.status || 'planning',
  };
}

function serializeDays(days) {
  return days.map((day, dayIndex) => ({
    ...(isMongoId(day._id || day.id) ? { _id: day._id || day.id } : {}),
    day_number: day.day_number ?? day.dayNumber ?? dayIndex + 1,
    date: day.date || null,
    start_hour: day.start_hour ?? day.startHour ?? 8,
    end_hour: day.end_hour ?? day.endHour ?? 20,
    activities: (day.activities || []).map((activity, index) => ({
      ...(isMongoId(activity._id || activity.id) ? { _id: activity._id || activity.id } : {}),
      place_id: activity.place_id || activity.place?.id || activity.place?._id || activity.place,
      order_index: index,
      notes: activity.notes || '',
    })),
  }));
}

export function useTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrips = useCallback(async () => {
    if (!user) { setTrips([]); setError(''); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/trips');
      setTrips((Array.isArray(data) ? data : []).map(normalizeTrip));
    } catch (fetchError) {
      setTrips([]);
      setError(fetchError?.message || 'Unable to load trips.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const createTrip = async (trip) => {
    if (!user) throw new Error('You must be logged in to create a trip');
    const payload = serializeTripPayload(trip);
    const data = await api.post('/trips', payload);
    let created = normalizeTrip(data.trip || data.plan || data);
    if (trip.days?.length && created?.id) {
      const updatedData = await api.put(`/trips/${created.id}`, { days: serializeDays(trip.days) });
      created = normalizeTrip(updatedData.trip || updatedData.plan || updatedData);
    }
    setTrips(prev => [created, ...prev]);
    return created;
  };

  const updateTrip = async (id, updates) => {
    if (!user) throw new Error('You must be logged in to update a trip');
    const payload = serializeTripPayload(updates);
    const data = await api.put(`/trips/${id}`, payload);
    const updated = normalizeTrip(data.trip || data.plan || data);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTrip = async (id) => {
    if (!user) throw new Error('You must be logged in to delete a trip');
    await api.delete(`/trips/${id}`);
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  return { trips, loading, error, createTrip, updateTrip, deleteTrip, refetch: fetchTrips };
}

export function useTripDetail(tripId) {
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const normalizeDays = (rawDays = []) => rawDays.map(day => ({
    ...day,
    id: day.id || day._id,
    day_number: day.day_number ?? day.dayNumber,
    start_hour: day.start_hour ?? day.startHour ?? 8,
    end_hour: day.end_hour ?? day.endHour ?? 20,
    activities: (day.activities || []).map(a => ({
      ...a,
      id: a.id || a._id,
      order_index: a.order_index ?? a.orderIndex ?? 0,
      place_id: a.place_id || a.place?._id || a.place?.id || a.place,
      place: normalizePlace(a.place),
    })).sort((a, b) => a.order_index - b.order_index),
  }));

  const fetchTripDetail = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await api.get(`/trips/${tripId}`);
      const normalized = normalizeTrip(data.trip || data.plan || data);
      setTrip(normalized);
      setDays(normalizeDays(normalized.days || []));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchTripDetail(); }, [fetchTripDetail]);

  const saveDays = async (nextDays) => {
    const previousDays = days;
    setDays(nextDays);
    setSaving(true);
    setSaveError('');
    try {
      const data = await api.put(`/trips/${tripId}`, { days: serializeDays(nextDays) });
      const updated = normalizeTrip(data.trip || data.plan || data);
      setTrip(updated);
      setDays(normalizeDays(updated.days || []));
      setLastSavedAt(new Date());
    } catch (error) {
      setDays(previousDays);
      setSaveError(error.message || 'Could not save itinerary.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addDay = async (dayNumber, date) => {
    const newDay = { id: crypto.randomUUID(), day_number: dayNumber, date: date || null, start_hour: 8, end_hour: 20, activities: [] };
    await saveDays([...days, newDay]);
    return newDay;
  };

  const removeDay = async (dayId) => {
    await saveDays(days.filter(d => d.id !== dayId));
  };

  const addActivity = async (dayId, placeId, orderIndex) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return null;
    const place = normalizePlace(await api.get(`/places/${placeId}`));
    const activity = { id: crypto.randomUUID(), place_id: placeId, place, order_index: orderIndex };
    const nextActivities = [...(day.activities || [])];
    nextActivities.splice(orderIndex ?? nextActivities.length, 0, activity);
    const nextDays = days.map(d => d.id === dayId ? { ...d, activities: nextActivities.map((a, i) => ({ ...a, order_index: i })) } : d);
    await saveDays(nextDays);
    return activity;
  };

  const removeActivity = async (dayId, activityId) => {
    const nextDays = days.map(d => d.id === dayId ? { ...d, activities: (d.activities || []).filter(a => a.id !== activityId).map((a, i) => ({ ...a, order_index: i })) } : d);
    await saveDays(nextDays);
  };

  const reorderActivities = async (dayId, activities) => {
    const nextDays = days.map(d => d.id === dayId ? { ...d, activities: activities.map((a, i) => ({ ...a, order_index: i })) } : d);
    await saveDays(nextDays);
  };

  const updateDayHours = async (dayId, startHour, endHour) => {
    const nextDays = days.map(d => d.id === dayId ? { ...d, start_hour: startHour, end_hour: endHour } : d);
    await saveDays(nextDays);
  };

  return {
    trip,
    days,
    loading,
    saving,
    saveError,
    lastSavedAt,
    addDay,
    removeDay,
    addActivity,
    removeActivity,
    reorderActivities,
    updateDayHours,
    refetch: fetchTripDetail,
  };
}
