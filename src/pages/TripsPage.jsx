import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Plus, Calendar, Clock, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from '../utils/date';

const STATUS_CONFIG = {
  planning: { label: 'Planning', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  upcoming: { label: 'Upcoming', class: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400' },
  ongoing: { label: 'Ongoing', class: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400' },
  completed: { label: 'Completed', class: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' },
};

const defaultForm = { title: '', destination: '', description: '', start_date: '', end_date: '', status: 'planning', cover_image: '' };

export default function TripsPage() {
  const { trips, loading, error, updateTrip, deleteTrip } = useTrips();
  const [editTrip, setEditTrip] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [filter, setFilter] = useState('all');

  const openEdit = (trip) => {
    setSaveError('');
    setEditTrip(trip);
    setForm({ title: trip.title, destination: trip.destination || '', description: trip.description, start_date: trip.start_date || '', end_date: trip.end_date || '', status: trip.status, cover_image: trip.cover_image });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateTrip(editTrip.id, form);
      setEditTrip(null);
    } catch (error) {
      setSaveError(error?.message || 'Could not save trip.');
    } finally {
      setSaving(false);
    }
  };

  const activeFilters = ['all', 'planning', 'upcoming', 'ongoing', 'completed'];
  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10">
        <section className="page-container flex items-center justify-between">
          <section className="flex items-center gap-3">
            <section className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Map className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </section>
            <section>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Trips</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
            </section>
          </section>
          <Link to="/planner" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </section>
      </section>

      <section className="page-container py-8">
        {error && (
          <section className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 mb-6 text-sm">
            {error}
          </section>
        )}
        <section className="flex gap-2 flex-wrap mb-6">
          {activeFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {f === 'all' ? 'All Trips' : STATUS_CONFIG[f].label}
              <span className="ml-1.5 text-xs opacity-70">
                {f === 'all' ? trips.length : trips.filter(t => t.status === f).length}
              </span>
            </button>
          ))}
        </section>

        {loading ? (
          <section className="flex justify-center py-24"><LoadingSpinner size="lg" /></section>
        ) : filtered.length === 0 ? (
          <section className="text-center py-24">
            <section className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Map className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
            </section>
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
            </h3>
            <p className="text-neutral-400 dark:text-neutral-500 mb-6">
              {filter === 'all' ? 'Create your first trip to start planning' : `You have no ${filter} trips`}
            </p>
            {filter === 'all' && <Link to="/planner" className="btn-primary">Create Trip</Link>}
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(trip => (
              <section key={trip.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                <section className="relative h-40 overflow-hidden">
                  <img
                    src={trip.cover_image || 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <section className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <section className="absolute top-3 left-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[trip.status].class}`}>
                      {STATUS_CONFIG[trip.status].label}
                    </span>
                  </section>
                </section>

                <section className="p-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{trip.title}</h3>
                  {trip.destination && <p className="text-primary-600 dark:text-primary-400 text-sm font-medium mb-1">{trip.destination}</p>}
                  {trip.description && <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3 line-clamp-2">{trip.description}</p>}

                  <section className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500 mb-4">
                    {trip.start_date && (
                      <section className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(trip.start_date)} — {trip.end_date ? format(trip.end_date) : 'TBD'}
                      </section>
                    )}
                    <section className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(trip.created_at)}
                    </section>
                  </section>

                  <section className="flex gap-2">
                    <Link
                      to={`/planner/${trip.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Open Planner <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => openEdit(trip)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </section>
                </section>
              </section>
            ))}
          </section>
        )}
      </section>

      <Modal
        open={!!editTrip}
        onClose={() => setEditTrip(null)}
        title="Edit Trip"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <section className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
              {saveError}
            </section>
          )}
          <section>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Trip Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input"
              placeholder="Optional — e.g., European Summer Adventure"
            />
          </section>

          <section>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Destination *</label>
            <input
              type="text"
              required
              value={form.destination}
              onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
              className="input"
              placeholder="e.g., Paris"
            />
          </section>
          <section>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="What's this trip about?"
            />
          </section>
          <section className="grid grid-cols-2 gap-3">
            <section>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Start Date</label>
              <input type="date" required value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="input" />
            </section>
            <section>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">End Date</label>
              <input type="date" required value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="input" />
            </section>
          </section>
          <section>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </section>
          <section>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Cover Image URL</label>
            <input
              type="url"
              value={form.cover_image}
              onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))}
              className="input"
              placeholder="https://..."
            />
          </section>
          <section className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditTrip(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </section>
        </form>
      </Modal>
    </section>
  );
}
