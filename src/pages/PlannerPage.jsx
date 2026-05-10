import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, History, Plus, Route } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import PlacePicker from '../components/planner/PlacePicker';
import PlannerDayColumn from '../components/planner/PlannerDayColumn';
import { addDateDays, buildDays, makeId, toUtcTime } from '../utils/plannerDates';

const defaultForm = {
  title: '',
  destination: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'planning',
  cover_image: '',
};

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
                <PlannerDayColumn
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
