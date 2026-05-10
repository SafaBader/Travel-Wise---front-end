import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

export default function DayHoursEditor({ day, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [sh, setSh] = useState(day.start_hour ?? 8);
    const [eh, setEh] = useState(day.end_hour ?? 20);

    const apply = () => {
        onUpdate(sh, eh);
        setOpen(false);
    };

    const fmt = h => {
        const ampm = h < 12 ? 'AM' : 'PM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:00 ${ampm}`;
    };

    return (
        <section className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
                <Clock className="w-3 h-3" />
                {fmt(day.start_hour ?? 8)} – {fmt(day.end_hour ?? 20)}
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {open && (
                <section className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl p-4 w-64">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide">Day hours</p>
                    <section className="grid grid-cols-2 gap-3 mb-3">
                        <section>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Start</label>
                            <select
                                value={sh}
                                onChange={e => setSh(Number(e.target.value))}
                                className="w-full text-sm px-2 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{fmt(i)}</option>
                                ))}
                            </select>
                        </section>
                        <section>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">End</label>
                            <select
                                value={eh}
                                onChange={e => setEh(Number(e.target.value))}
                                className="w-full text-sm px-2 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{fmt(i)}</option>
                                ))}
                            </select>
                        </section>
                    </section>
                    <button onClick={apply} className="w-full py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Apply
                    </button>
                </section>
            )}
        </section>
    );
}

