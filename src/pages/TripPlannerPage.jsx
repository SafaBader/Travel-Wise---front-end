import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Plus, Trash2, GripVertical, MapPin,
    Clock, Calendar, Star, X, AlertTriangle,
    CheckCircle, Loader2
} from 'lucide-react';
import { useTripDetail } from '../hooks/useTrips';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format, addDays } from '../utils/date';
import PlaceSidebar from '../components/planner/PlaceSidebar';
import DayTimeWarning from '../components/planner/DayTimeWarning';
import DayHoursEditor from '../components/planner/DayHoursEditor';
import { parseDurationHours } from '../utils/plannerTime';

export default function TripPlannerPage() {
    const { id } = useParams();
    const {
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
    } = useTripDetail(id);
    const [dragItem, setDragItem] = useState(null);
    const [dragOver, setDragOver] = useState(null);
    const [addingDay, setAddingDay] = useState(false);

    if (loading) return (
        <section className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <LoadingSpinner size="lg" />
        </section>
    );
    if (!trip) return (
        <section className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <p className="text-neutral-500 dark:text-neutral-400">Trip not found.</p>
        </section>
    );

    const handleAddDay = async () => {
        setAddingDay(true);
        try {
            const nextDayNum = days.length + 1;
            const date = trip.start_date ? addDays(trip.start_date, days.length) : undefined;
            await addDay(nextDayNum, date);
        } finally {
            setAddingDay(false);
        }
    };

    const handleAddToDay = async (dayId, placeId) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;
        if (day.activities?.some(a => a.place_id === placeId)) return;
        await addActivity(dayId, placeId, day.activities?.length || 0);
    };

    // Drag from itinerary cards
    const handleDragStart = (dayId, activity) => setDragItem({ dayId, activity, type: 'activity' });

    const handleDrop = async (targetDayId, targetIndex) => {
        if (!dragItem) return;

        if (dragItem.type === 'activity') {
            // Moving an existing activity
            if (dragItem.dayId === targetDayId) {
                // Reorder within same day
                const day = days.find(d => d.id === targetDayId);
                if (!day) return;
                const acts = [...(day.activities || [])];
                const fromIdx = acts.findIndex(a => a.id === dragItem.activity.id);
                if (fromIdx === -1) return;
                const [moved] = acts.splice(fromIdx, 1);
                acts.splice(targetIndex, 0, moved);
                await reorderActivities(targetDayId, acts);
            } else {
                // Move to different day
                await removeActivity(dragItem.dayId, dragItem.activity.id);
                await addActivity(targetDayId, dragItem.activity.place_id, targetIndex);
            }
        }

        setDragItem(null);
        setDragOver(null);
    };

    // Drop from sidebar (place drag)
    const handleDropFromSidebar = async (e, dayId, index) => {
        e.preventDefault();
        const placeId = e.dataTransfer.getData('placeId');
        if (placeId) {
            await handleAddToDay(dayId, placeId);
        } else if (dragItem?.type === 'activity') {
            await handleDrop(dayId, index);
        }
        setDragOver(null);
    };

    return (
        <section className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Sub-header */}
            <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-4 sticky top-16 z-30">
                <section className="page-container flex items-center justify-between">
                    <section className="flex items-center gap-2 text-sm">
                        <Link to="/trips" className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Trips
                        </Link>
                        <span className="text-neutral-300 dark:text-neutral-700">/</span>
                        <h1 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">{trip.title}</h1>
                    </section>
                    <section className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                        <section className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${saveError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : saving
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400'
                            }`}>
                            {saveError ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                            ) : saving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="font-medium">
                                {saveError ? 'Save failed' : saving ? 'Saving...' : lastSavedAt ? 'Saved' : 'Autosave on'}
                            </span>
                        </section>
                        {trip.start_date && (
                            <section className="hidden sm:flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(trip.start_date)}
                                {trip.end_date && <> — {format(trip.end_date)}</>}
                            </section>
                        )}
                    </section>
                </section>
            </section>

            <section className="page-container py-6 flex gap-6 items-start">
                {/* ── Place Picker Sidebar ── */}
                <PlaceSidebar trip={trip} days={days} onAddToDay={handleAddToDay} />

                {/* ── Itinerary ── */}
                <section className="flex-1 min-w-0">
                    {saveError && (
                        <section className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-400">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <section>
                                <p className="font-semibold">Your last itinerary change was not saved.</p>
                                <p className="text-red-600 dark:text-red-400/90 text-xs mt-0.5">{saveError}</p>
                            </section>
                        </section>
                    )}
                    <section className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Itinerary
                            <span className="ml-2 text-sm font-normal text-neutral-400 dark:text-neutral-500">
                                {days.length} {days.length === 1 ? 'day' : 'days'}
                            </span>
                        </h2>
                        <button
                            onClick={handleAddDay}
                            disabled={addingDay}
                            className="btn-primary text-sm flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Add Day
                        </button>
                    </section>

                    {days.length === 0 ? (
                        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-12 text-center shadow-sm">
                            <Calendar className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
                            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No days yet</h3>
                            <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-4">
                                Add a day to start building your itinerary, then drag places from the panel on the left.
                            </p>
                            <button onClick={handleAddDay} className="btn-primary text-sm">Add First Day</button>
                        </section>
                    ) : (
                        <section className="space-y-4">
                            {days.map((day, dayIdx) => {
                                const startHour = day.start_hour ?? 8;
                                const endHour = day.end_hour ?? 20;
                                const availableHours = Math.max(0, endHour - startHour);
                                const totalHours = (day.activities || []).reduce(
                                    (sum, act) => sum + parseDurationHours(act.place?.estimated_duration),
                                    0
                                );
                                const isOverloaded = totalHours > availableHours;
                                const isBusy = !isOverloaded && totalHours >= availableHours * 0.85;
                                const usedPct = availableHours > 0 ? Math.min(100, (totalHours / availableHours) * 100) : 0;

                                return (
                                    <section
                                        key={day.id}
                                        className={`bg-white dark:bg-neutral-900 rounded-2xl border-2 shadow-sm overflow-visible transition-colors ${isOverloaded
                                            ? 'border-red-200 dark:border-red-900/50'
                                            : isBusy
                                                ? 'border-amber-200 dark:border-amber-900/50'
                                                : 'border-neutral-100 dark:border-neutral-800'
                                            }`}
                                    >
                                        {/* Day header */}
                                        <section className={`flex items-center justify-between px-5 py-3 border-b ${isOverloaded
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                                            : isBusy
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
                                                : 'bg-neutral-50/80 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800'
                                            }`}>
                                            <section className="flex items-center gap-3">
                                                <section className={`w-8 h-8 text-white rounded-lg flex items-center justify-center text-sm font-bold ${isOverloaded ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-primary-600'
                                                    }`}>
                                                    {dayIdx + 1}
                                                </section>
                                                <section>
                                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Day {day.day_number}</p>
                                                    {day.date && <p className="text-xs text-neutral-400 dark:text-neutral-500">{format(day.date)}</p>}
                                                </section>
                                                <DayHoursEditor day={day} onUpdate={(s, e) => updateDayHours(day.id, s, e)} />
                                            </section>

                                            <section className="flex items-center gap-2">
                                                {/* Time progress bar */}
                                                <section className="hidden sm:flex items-center gap-2">
                                                    <section className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                        <section
                                                            className={`h-full rounded-full transition-all ${isOverloaded ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-primary-500'
                                                                }`}
                                                            style={{ width: `${usedPct}%` }}
                                                        />
                                                    </section>
                                                    <span className={`text-xs font-medium ${isOverloaded
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : isBusy
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-neutral-500 dark:text-neutral-400'
                                                        }`}>
                                                        {Math.round(totalHours * 10) / 10}h / {availableHours}h
                                                    </span>
                                                </section>
                                                <button
                                                    onClick={() => removeDay(day.id)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </section>
                                        </section>

                                        {/* Warning */}
                                        {isOverloaded && (
                                            <DayTimeWarning day={day} availableHours={availableHours} totalHours={Math.round(totalHours * 10) / 10} />
                                        )}

                                        {/* Activities */}
                                        <section className="p-3">
                                            {(!day.activities || day.activities.length === 0) ? (
                                                <section
                                                    onDragOver={e => { e.preventDefault(); setDragOver(`${day.id}-empty`); }}
                                                    onDrop={e => handleDropFromSidebar(e, day.id, 0)}
                                                    onDragLeave={() => setDragOver(null)}
                                                    className={`border-2 border-dashed rounded-xl p-8 text-center text-sm transition-all ${dragOver === `${day.id}-empty`
                                                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400'
                                                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                                                        }`}
                                                >
                                                    Drop places here or use the + button in the sidebar
                                                </section>
                                            ) : (
                                                <section className="space-y-2">
                                                    {day.activities.map((activity, actIdx) => {
                                                        const dur = parseDurationHours(activity.place?.estimated_duration);
                                                        return (
                                                            <section
                                                                key={activity.id}
                                                                draggable
                                                                onDragStart={() => handleDragStart(day.id, activity)}
                                                                onDragOver={e => { e.preventDefault(); setDragOver(`${day.id}-${actIdx}`); }}
                                                                onDrop={e => { e.preventDefault(); handleDrop(day.id, actIdx); }}
                                                                onDragLeave={() => setDragOver(null)}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${dragOver === `${day.id}-${actIdx}`
                                                                    ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                                                                    : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-700'
                                                                    } ${dragItem?.activity?.id === activity.id ? 'opacity-40 scale-95' : ''}`}
                                                            >
                                                                <GripVertical className="w-4 h-4 text-neutral-300 dark:text-neutral-600 shrink-0" />
                                                                <section className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                                                                    <img
                                                                        src={activity.place?.images?.[0] || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg'}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </section>
                                                                <section className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{activity.place?.name}</p>
                                                                    <section className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 flex-wrap">
                                                                        <span className="flex items-center gap-1">
                                                                            <MapPin className="w-2.5 h-2.5" />
                                                                            {activity.place?.location}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            ~{dur}h
                                                                        </span>
                                                                    </section>
                                                                </section>
                                                                <section className="flex items-center gap-1 shrink-0">
                                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        {Number(activity.place?.rating || 0).toFixed(1)}
                                                                    </span>
                                                                </section>
                                                                <button
                                                                    onClick={() => removeActivity(day.id, activity.id)}
                                                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </section>
                                                        );
                                                    })}

                                                    {/* Drop zone at end */}
                                                    <section
                                                        onDragOver={e => { e.preventDefault(); setDragOver(`${day.id}-append`); }}
                                                        onDrop={e => handleDropFromSidebar(e, day.id, day.activities.length)}
                                                        onDragLeave={() => setDragOver(null)}
                                                        className={`border-2 border-dashed rounded-xl p-2.5 text-center text-xs transition-all ${dragOver === `${day.id}-append`
                                                            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-400'
                                                            : 'border-neutral-100 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600'
                                                            }`}
                                                    >
                                                        Drop to add at end
                                                    </section>
                                                </section>
                                            )}
                                        </section>
                                    </section>
                                );
                            })}
                        </section>
                    )}
                </section>
            </section>
        </section>
    );
}
