export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekDays(anchor = new Date()) {
  const d = new Date(anchor);
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

export function daysWithCalendarDots(weekDays, schedules, visits) {
  const keys = new Set();
  for (const day of weekDays) {
    const key = dateKey(day);
    const dow = day.getDay();
    if (schedules?.some((s) => s.day_of_week === dow)) keys.add(key);
    if (visits?.some((v) => v.visit_date === key)) keys.add(key);
  }
  return keys;
}
