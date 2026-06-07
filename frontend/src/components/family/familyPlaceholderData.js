/** Demo anchor: Wednesday June 3, 2026 */
export const DEMO_TODAY = new Date(2026, 5, 3);

export const RESIDENT_NAME = 'Mary Chen';

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekDays(anchor = DEMO_TODAY) {
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

export const CALENDAR_EVENTS = {
  '2026-06-01': {
    facility: [
      { id: 'f1', time: '10:00 AM', name: 'Physical Therapy', location: 'Room 4B', status: 'Attended' },
    ],
    family: [],
  },
  '2026-06-02': {
    facility: [
      { id: 'f2', time: '2:00 PM', name: 'Bingo', location: 'Activity Room', status: 'Attended' },
    ],
    family: [
      {
        id: 'v1',
        visitor: 'Jenny Chen',
        relationship: 'Daughter',
        time: '3:00 PM',
        duration: '1 hour',
        status: 'Confirmed',
      },
    ],
  },
  '2026-06-03': {
    facility: [
      { id: 'f3', time: '11:00 AM', name: 'Music session', location: 'Common Room', status: 'Attended' },
    ],
    family: [],
  },
  '2026-06-04': {
    facility: [
      { id: 'f4', time: '10:00 AM', name: 'Physical Therapy', location: 'Room 4B', status: 'Scheduled' },
    ],
    family: [],
  },
  '2026-06-05': {
    facility: [
      { id: 'f5', time: '6:00 PM', name: 'Movie night', location: 'Theater', status: 'Scheduled' },
    ],
    family: [],
  },
};

export function daysWithCalendarEvents(weekDays) {
  return new Set(
    weekDays
      .map((d) => dateKey(d))
      .filter((key) => {
        const e = CALENDAR_EVENTS[key];
        return e && (e.facility.length > 0 || e.family.length > 0);
      })
  );
}

export const DAILY_RECORDS = {
  '2026-06-03': {
    meals: {
      breakfast: 'Ate well',
      lunch: 'Ate well',
      dinner: 'Partial',
      hydration: 'Good',
    },
    mood: { morning: { emoji: '😊', label: 'Good' }, evening: { emoji: '😴', label: 'Tired' } },
    activities: [
      { name: 'Physical Therapy', time: '10:00 AM', status: 'attended' },
      { name: 'Afternoon Reading', time: '2:00 PM', status: 'attended' },
    ],
    staffNote:
      'Mary did her physical therapy exercises this morning with no complaints. The therapist said she is making good progress. She was tired afterward but in good spirits.',
  },
};

export const PHOTO_TIMELINE = [
  {
    id: 'p1',
    date: '2026-06-06',
    monthLabel: 'June 2026',
    caption: 'Mary in the garden after morning walk',
    staff: 'Sarah Reyes',
    seed: 'mary-garden',
  },
  {
    id: 'p2',
    date: '2026-06-05',
    monthLabel: 'June 2026',
    caption: 'Enjoying bingo with friends',
    staff: 'David Park',
    seed: 'mary-bingo',
  },
  {
    id: 'p3',
    date: '2026-06-03',
    monthLabel: 'June 2026',
    caption: 'Music session — Mary loves this group',
    staff: 'Aisha Thompson',
    seed: 'mary-music',
  },
  {
    id: 'p4',
    date: '2026-06-01',
    monthLabel: 'June 2026',
    caption: 'Morning coffee on the patio',
    staff: 'Sarah Reyes',
    seed: 'mary-coffee',
  },
  {
    id: 'p5',
    date: '2026-05-28',
    monthLabel: 'May 2026',
    caption: 'Afternoon walk with care team',
    staff: 'David Park',
    seed: 'mary-walk-may',
  },
  {
    id: 'p6',
    date: '2026-05-22',
    monthLabel: 'May 2026',
    caption: 'Birthday celebration with friends',
    staff: 'Aisha Thompson',
    seed: 'mary-birthday',
  },
  {
    id: 'p7',
    date: '2026-05-15',
    monthLabel: 'May 2026',
    caption: 'Art class — watercolor flowers',
    staff: 'Sarah Reyes',
    seed: 'mary-art',
  },
  {
    id: 'p8',
    date: '2026-05-08',
    monthLabel: 'May 2026',
    caption: 'Sunny day in the courtyard',
    staff: 'David Park',
    seed: 'mary-courtyard',
  },
];

export { dateKey };
