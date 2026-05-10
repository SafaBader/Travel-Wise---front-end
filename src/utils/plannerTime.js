export function parseDurationHours(str) {
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

export function formatHour(hour) {
    const ampm = hour < 12 ? 'AM' : 'PM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:00 ${ampm}`;
}

export function getDayTimeStats(day) {
    const totalHours = (day.activities || []).reduce(
        (sum, activity) => sum + parseDurationHours(activity.place?.estimated_duration),
        0
    );
    const availableHours = Math.max(0, (day.end_hour ?? 20) - (day.start_hour ?? 8));
    const isOverloaded = totalHours > availableHours;
    const isBusy = !isOverloaded && availableHours > 0 && totalHours >= availableHours * 0.85;
    const usedPct = availableHours > 0 ? Math.min(100, (totalHours / availableHours) * 100) : 0;

    return {
        totalHours: Math.round(totalHours * 10) / 10,
        availableHours,
        isOverloaded,
        isBusy,
        usedPct,
    };
}
