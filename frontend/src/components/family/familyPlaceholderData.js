/** Demo anchor: Wednesday June 3, 2026 */
export const DEMO_TODAY = new Date(2026, 5, 3);

export const RESIDENT_NAME = 'Rosa Haro';

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
      { id: 'f2', time: '10:30 AM', name: 'Garden Walk', location: 'Garden', status: 'Attended' },
    ],
    family: [
      {
        id: 'v1',
        visitor: 'Jenny Haro',
        relationship: 'Daughter',
        time: '3:00 PM',
        duration: '1 hour',
        status: 'Confirmed',
      },
    ],
  },
  '2026-06-03': {
    facility: [
      { id: 'f3', time: '11:00 AM', name: 'Music Session', location: 'Sunroom', status: 'Attended' },
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
      { id: 'f5', time: '6:00 PM', name: 'Movie Night', location: 'Main Hall', status: 'Scheduled' },
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
      'Rosa walked into PT calling herself "la atleta del jardín." She balanced longer than last week, then spent the afternoon in the library with her Spanish novel.',
  },
};

export const PHOTO_TIMELINE = [
  {
    id: 'p1',
    date: '2026-06-06',
    monthLabel: 'June 2026',
    caption:
      'Rosa was up early this morning and wanted her coffee on the patio. She sat outside for almost an hour, said the air reminded her of mornings back in Guadalajara.',
    staff: 'Sarah Reyes',
    photo_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
  },
  {
    id: 'p2',
    date: '2026-06-05',
    monthLabel: 'June 2026',
    caption:
      'Took Rosa on a slow walk through the garden this afternoon. She stopped at the rose bushes for a long time and told me about the garden she kept for thirty years back home.',
    staff: 'David Park',
    photo_url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
  },
  {
    id: 'p3',
    date: '2026-06-04',
    monthLabel: 'June 2026',
    caption:
      'Rosa finished her whole lunch today and asked for seconds of the soup. She saved her flan for later — said Jenny is coming Sunday and she wants to share it with her.',
    staff: 'Aisha Thompson',
    photo_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  },
  {
    id: 'p4',
    date: '2026-06-03',
    monthLabel: 'June 2026',
    caption:
      'Rosa worked through her full PT session this morning without stopping once. The therapist said her balance has improved a lot this month. Rosa said she is determined to dance at Jenny\'s wedding someday.',
    staff: 'Sarah Reyes',
    photo_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  },
];

export { dateKey };
