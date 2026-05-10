import { useState } from 'react';
import { Clock, MapPin, Plus, Star } from 'lucide-react';
import { parseDurationHours } from '../../utils/plannerTime';

export default function DraggablePlaceItem({ place, days, onAddToDay }) {
    const [showDays, setShowDays] = useState(false);
    const duration = parseDurationHours(place.estimated_duration);

    return (
        <section
            draggable
            onDragStart={e => {
                e.dataTransfer.setData('placeId', place.id);
                e.dataTransfer.effectAllowed = 'copy';
            }}
            className="group flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700"
        >
            <section className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                <img src={place.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
            </section>
            <section className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{place.name}</p>
                <section className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{place.location}</span>
                    <span className="mx-0.5">·</span>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span>{duration}h</span>
                </section>
            </section>
            {days.length > 0 && (
                <section className="shrink-0 relative">
                    <button
                        onClick={() => setShowDays(v => !v)}
                        className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                        title="Add to day"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    {showDays && (
                        <section className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl py-1 min-w-[100px]">
                            {days.map(day => (
                                <button
                                    key={day.id}
                                    onClick={() => { onAddToDay(day.id, place.id); setShowDays(false); }}
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

