import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Calendar, Clock, Globe, GripVertical, Heart,
  History, MapPin, Plus, Route, Search, X
} from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { useFavorites } from '../hooks/useFavorites';
import { usePlaces, useCategories } from '../hooks/usePlaces';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from '../utils/date';

const defaultForm = {
  title: '',
  destination: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'planning',
  cover_image: '',
};

const makeId = () => crypto.randomUUID();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function toUtcTime(dateStr) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function daysBetweenDates(startDate, endDate) {
  const startTime = toUtcTime(startDate);
  const endTime = toUtcTime(endDate);
  if (startTime === null || endTime === null || endTime < startTime) return 1;
  return Math.floor((endTime - startTime) / MS_PER_DAY) + 1;
}

function addDateDays(dateStr, amount) {
  const startTime = toUtcTime(dateStr);
  if (startTime === null) return null;
  const date = new Date(startTime + amount * MS_PER_DAY);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDurationHours(str) {
  if (!str) return 2;
  if (typeof str === 'number') return str;
  const s = String(str).toLowerCase();
  let hours = 0;
  const dayMatch = s.match(/(\d+(?:\.\d+)?)\s*day/);
  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
  const mMatch = s.match(/(\d+)\s*m(?:in)?/);
  if (dayMatch) hours += parseFloat(dayMatch[1]) * 8;
  if (hMatch) hours += parseFloat(hMatch[1]);
  if (mMatch) hours += parseInt(mMatch[1]) / 60;
  if (hours === 0) {
    const n = parseFloat(s);
    if (!isNaN(n)) hours = n;
  }
  return Math.round((hours || 2) * 10) / 10;
}

function buildDays(startDate, endDate, currentDays) {
  const count = startDate && endDate ? daysBetweenDates(startDate, endDate) : 1;
  return Array.from({ length: count }, (_, index) => {
    const existing = currentDays[index];
    return {
      id: existing?.id || makeId(),
      day_number: index + 1,
      date: startDate ? addDateDays(startDate, index) : existing?.date || null,
      start_hour: existing?.start_hour ?? 8,
      end_hour: existing?.end_hour ?? 20,
      activities: existing?.activities || [],
    };
  });
}

function formatHour(hour) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:00 ${ampm}`;
}

function PlacePicker({ destination, days, onAddPlace }) {
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

function PlaceItem({ place, days, onAddPlace }) {
  const [showDays, setShowDays] = useState(false);
  const duration = parseDurationHours(place.estimated_duration);

  const startDrag = (event) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('place', JSON.stringify(place));
  };

  return (
    <section
      draggable
      onDragStart={startDrag}
      className="group flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700"
    >
      <section className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
        <img src={place.images?.[0] || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg'} alt="" className="w-full h-full object-cover" />
      </section>
      <section className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{place.name}</p>
        <section className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{place.location}</span>
          <Clock className="w-2.5 h-2.5 shrink-0 ml-1" />
          <span>{duration}h</span>
        </section>
      </section>
      {days.length > 0 && (
        <section className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowDays(value => !value)}
            className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
            title="Add to day"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {showDays && (
            <section className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl py-1 min-w-[100px]">
              {days.map(day => (
                <button
                  type="button"
                  key={day.id}
                  onClick={() => { onAddPlace(day.id, place); setShowDays(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Day {day.day_number}
                </button>
              ))}
            </section>
          )}
        </section>
      )}
    </section>
  );
}

function DayColumn({ day, isDragOver, onDragOver, onDragLeave, onDrop, onRemoveActivity, onUpdateHours }) {
  const totalHours = (day.activities || []).reduce((sum, activity) => sum + parseDurationHours(activity.place?.estimated_duration), 0);
  const availableHours = Math.max(0, (day.end_hour ?? 20) - (day.start_hour ?? 8));
  const isOverloaded = totalHours > availableHours;
  const isBusy = !isOverloaded && availableHours > 0 && totalHours >= availableHours * 0.85;
  const usedPct = availableHours > 0 ? Math.min(100, (totalHours / availableHours) * 100) : 0;

  return (
    <section
      onDragOver={(event) => onDragOver(event, day.id)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, day.id)}
      className={`w-full bg-white dark:bg-neutral-900 rounded-2xl border-2 shadow-sm overflow-hidden transition-colors ${
        isDragOver
          ? 'border-primary-400 dark:border-primary-600'
          : isOverloaded
          ? 'border-red-200 dark:border-red-900/50'
          : isBusy
          ? 'border-amber-200 dark:border-amber-900/50'
          : 'border-neutral-100 dark:border-neutral-800'
      }`}
    >
      <section className={`px-4 py-3 border-b ${
        isOverloaded
          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
          : isBusy
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
          : 'bg-neutral-50/80 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800'
      }`}>
        <section className="flex items-center justify-between gap-3">
          <section>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Day {day.day_number}</h3>
            {day.date && <p className="text-xs text-neutral-400 dark:text-neutral-500">{format(day.date)}</p>}
          </section>
          <span className={`text-xs font-medium bg-white dark:bg-neutral-900 px-2 py-1 rounded-lg ${
            isOverloaded
              ? 'text-red-600 dark:text-red-400'
              : isBusy
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}>
            {Math.round(totalHours * 10) / 10}h / {availableHours}h
          </span>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">
            Start
            <select
              value={day.start_hour ?? 8}
              onChange={event => onUpdateHours(day.id, Number(event.target.value), day.end_hour ?? 20)}
              className="mt-1 w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {Array.from({ length: 24 }, (_, hour) => (
                <option key={hour} value={hour}>{formatHour(hour)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-neutral-500 dark:text-neutral-400">
            End
            <select
              value={day.end_hour ?? 20}
              onChange={event => onUpdateHours(day.id, day.start_hour ?? 8, Number(event.target.value))}
              className="mt-1 w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {Array.from({ length: 24 }, (_, hour) => (
                <option key={hour} value={hour}>{formatHour(hour)}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-3 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <section
            className={`h-full rounded-full transition-all ${
              isOverloaded ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-primary-500'
            }`}
            style={{ width: `${usedPct}%` }}
          />
        </section>
      </section>

      <section className="p-3 min-h-[300px]">
        {isOverloaded && (
          <section className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">
              This day is too full. Planned places need ~{Math.round(totalHours * 10) / 10}h, but only {availableHours}h are available.
            </p>
          </section>
        )}
        {day.activities.length === 0 ? (
          <section className={`h-full min-h-[270px] border-2 border-dashed rounded-xl flex items-center justify-center text-center px-5 text-sm transition-colors ${
            isDragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
          }`}>
            Drop places here
          </section>
        ) : (
          <section className="space-y-2">
            {day.activities.map((activity, index) => (
              <section key={activity.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/50">
                <GripVertical className="w-4 h-4 text-neutral-300 dark:text-neutral-600 shrink-0" />
                <img
                  src={activity.place?.images?.[0] || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg'}
                  alt=""
                  className="w-9 h-9 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
                />
                <section className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{activity.place?.name}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                    {index + 1}. {activity.place?.location || 'Place'}
                  </p>
                </section>
                <button
                  type="button"
                  onClick={() => onRemoveActivity(day.id, activity.id)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </section>
            ))}
          </section>
        )}
      </section>
    </section>
  );
}

export default function PlannerPage() {
  const navigate = useNavigate();
  const { createTrip } = useTrips();
  const [form, setForm] = useState(defaultForm);
  const [days, setDays] = useState(() => buildDays('', '', []));
  const [dragOverDay, setDragOverDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setDays(currentDays => buildDays(form.start_date, form.end_date, currentDays));
  }, [form.start_date, form.end_date]);

  const totalPlaces = useMemo(() => days.reduce((sum, day) => sum + day.activities.length, 0), [days]);

  const updateForm = (field, value) => {
    setForm(previous => {
      const next = { ...previous, [field]: value };
      if (field === 'start_date' && next.end_date && toUtcTime(next.end_date) < toUtcTime(value)) {
        next.end_date = '';
      }
      return next;
    });
  };

  const addDay = () => {
    setDays(currentDays => {
      const nextIndex = currentDays.length;
      return [
        ...currentDays,
        {
          id: makeId(),
          day_number: nextIndex + 1,
          date: form.start_date ? addDateDays(form.start_date, nextIndex) : null,
          start_hour: 8,
          end_hour: 20,
          activities: [],
        },
      ];
    });
  };

  const addPlaceToDay = (dayId, place) => {
    setDays(currentDays => currentDays.map(day => {
      if (day.id !== dayId || day.activities.some(activity => activity.place_id === place.id)) return day;
      return {
        ...day,
        activities: [
          ...day.activities,
          {
            id: makeId(),
            place_id: place.id,
            place,
            order_index: day.activities.length,
          },
        ],
      };
    }));
  };

  const removeActivity = (dayId, activityId) => {
    setDays(currentDays => currentDays.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        activities: day.activities
          .filter(activity => activity.id !== activityId)
          .map((activity, index) => ({ ...activity, order_index: index })),
      };
    }));
  };

  const updateDayHours = (dayId, startHour, endHour) => {
    setDays(currentDays => currentDays.map(day => (
      day.id === dayId ? { ...day, start_hour: startHour, end_hour: endHour } : day
    )));
  };

  const handleDrop = (event, dayId) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('place');
    if (!payload) return;
    addPlaceToDay(dayId, JSON.parse(payload));
    setDragOverDay(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await createTrip({ ...form, days });
      navigate('/trips');
    } catch (error) {
      setSaveError(error?.message || 'Could not save trip.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <form onSubmit={handleSave} className="page-container py-6">
          <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
            <section className="flex items-start gap-4">
              <section className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Route className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </section>
              <section>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Planner</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
                  Enter the trip details, drag places into each day, then save it to your trips.
                </p>
              </section>
            </section>

            <section className="flex flex-wrap gap-3">
              <Link to="/trips" className="btn-secondary flex items-center gap-2">
                <History className="w-4 h-4" />
                All Trips
              </Link>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? 'Saving...' : 'Save Trip'}
              </button>
            </section>
          </section>

          {saveError && (
            <section className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 mb-5 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </section>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <section className="lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Trip Title</label>
              <input
                value={form.title}
                onChange={event => updateForm('title', event.target.value)}
                className="input"
                placeholder="Optional - e.g., Summer in Italy"
              />
            </section>
            <section className="lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Destination *</label>
              <input
                required
                value={form.destination}
                onChange={event => updateForm('destination', event.target.value)}
                className="input"
                placeholder="e.g., Rome"
              />
            </section>
            <section className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Start *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={event => updateForm('start_date', event.target.value)}
                className="input"
              />
            </section>
            <section className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">End *</label>
              <input
                type="date"
                required
                min={form.start_date || undefined}
                value={form.end_date}
                onChange={event => updateForm('end_date', event.target.value)}
                className="input"
              />
            </section>
            <section className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Cover URL</label>
              <input
                type="url"
                value={form.cover_image}
                onChange={event => updateForm('cover_image', event.target.value)}
                className="input"
                placeholder="https://..."
              />
            </section>
            <section className="lg:col-span-12">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={event => updateForm('description', event.target.value)}
                rows={2}
                className="input resize-none"
                placeholder="What kind of trip are you planning?"
              />
            </section>
          </section>
        </form>
      </section>

      <section className="page-container py-6">
        <section className="flex items-center justify-between gap-4 mb-5">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Itinerary Board</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {days.length} {days.length === 1 ? 'day' : 'days'} - {totalPlaces} {totalPlaces === 1 ? 'place' : 'places'}
            </p>
          </section>
          <button type="button" onClick={addDay} className="btn-secondary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Add Day
          </button>
        </section>

        <section className="flex flex-col lg:flex-row gap-6 items-start">
          <PlacePicker destination={form.destination} days={days} onAddPlace={addPlaceToDay} />

          <section className="w-full min-w-0">
            <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {days.map(day => (
                <DayColumn
                  key={day.id}
                  day={day}
                  isDragOver={dragOverDay === day.id}
                  onDragOver={(event, dayId) => {
                    event.preventDefault();
                    setDragOverDay(dayId);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={handleDrop}
                  onRemoveActivity={removeActivity}
                  onUpdateHours={updateDayHours}
                />
              ))}
            </section>
          </section>
        </section>
      </section>
    </section>
  );
}
