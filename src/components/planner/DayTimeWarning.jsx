import { AlertTriangle } from 'lucide-react';

export default function DayTimeWarning({ day, availableHours, totalHours }) {
    if (totalHours <= availableHours) return null;
    const overBy = Math.round((totalHours - availableHours) * 10) / 10;
    return (
        <section className="flex items-start gap-3 mx-3 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <section>
                <p className="font-semibold text-amber-700 dark:text-amber-400">Schedule may be too full</p>
                <p className="text-amber-600 dark:text-amber-500 text-xs mt-0.5">
                    Please pay attention and reconsider your schedule. The selected places may exceed your available time for this day.
                    Selected places need ~{totalHours}h but you only have {availableHours}h available (over by {overBy}h).
                </p>
            </section>
        </section>
    );
}

