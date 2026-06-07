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
    caption:
      'Mary worked hard in physical therapy this morning. The therapist said she is making real progress.',
    staff: 'David Park',
    photo_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  },
  {
    id: 'p2',
    date: '2026-06-05',
    monthLabel: 'June 2026',
    caption:
      'Mary enjoying her morning coffee on the patio. She was in great spirits and chatted with a few neighbors.',
    staff: 'Sarah Reyes',
    photo_url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
  },
  {
    id: 'p3',
    date: '2026-06-04',
    monthLabel: 'June 2026',
    caption:
      'Mary spent some time in the garden this afternoon. She stopped to smell the roses and said it reminded her of her backyard growing up.',
    staff: 'David Park',
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
  },
  {
    id: 'p4',
    date: '2026-06-03',
    monthLabel: 'June 2026',
    caption:
      'Mary finished her whole lunch today and even asked for seconds of the soup. A really good day.',
    staff: 'Aisha Thompson',
    photo_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
  },
];

export { dateKey };
