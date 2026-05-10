import { AlertTriangle, GripVertical, X } from 'lucide-react';
import { format } from '../../utils/date';
import { formatHour, getDayTimeStats } from '../../utils/plannerTime';

export default function PlannerDayColumn({ day, isDragOver, onDragOver, onDragLeave, onDrop, onRemoveActivity, onUpdateHours }) {
    const { totalHours, availableHours, isOverloaded, isBusy, usedPct } = getDayTimeStats(day);

    return (
        <section
            onDragOver={(event) => onDragOver(event, day.id)}
            onDragLeave={onDragLeave}
            onDrop={(event) => onDrop(event, day.id)}
            className={`w-full bg-white dark:bg-neutral-900 rounded-2xl border-2 shadow-sm overflow-hidden transition-colors ${isDragOver
                ? 'border-primary-400 dark:border-primary-600'
                : isOverloaded
                    ? 'border-red-200 dark:border-red-900/50'
                    : isBusy
                        ? 'border-amber-200 dark:border-amber-900/50'
                        : 'border-neutral-100 dark:border-neutral-800'
                }`}
        >
            <section className={`px-4 py-3 border-b ${isOverloaded
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
                    <span className={`text-xs font-medium bg-white dark:bg-neutral-900 px-2 py-1 rounded-lg ${isOverloaded
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
                        className={`h-full rounded-full transition-all ${isOverloaded ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-primary-500'
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
                    <section className={`h-full min-h-[270px] border-2 border-dashed rounded-xl flex items-center justify-center text-center px-5 text-sm transition-colors ${isDragOver
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

