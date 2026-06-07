import React, { useMemo, useState } from 'react';
import DayStrip from './DayStrip';
import {
  DAILY_RECORDS,
  DEMO_TODAY,
  RESIDENT_NAME,
  dateKey,
  daysWithCalendarEvents,
  getWeekDays,
} from './familyPlaceholderData';
import { FAMILY_ACCENT, FAMILY_MUTED, familyCardClass } from './familyTheme';

function MealPill({ status }) {
  const map = {
    'Ate well': 'bg-emerald-50 text-emerald-700',
    Partial: 'bg-amber-50 text-amber-700',
    Skipped: 'bg-red-50 text-red-600',
    '—': 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[status] || map['—']}`}>
      {status}
    </span>
  );
}

function ActivityIcon({ status }) {
  if (status === 'attended') return <span className="text-emerald-600 text-[15px]">✓</span>;
  if (status === 'missed') return <span className="text-red-500 text-[15px]">✕</span>;
  return <span className="text-gray-400 text-[15px]">—</span>;
}

export default function FamilyDailyRecordTab() {
  const weekDays = useMemo(() => getWeekDays(DEMO_TODAY), []);
  const eventDays = useMemo(() => daysWithCalendarEvents(weekDays), [weekDays]);
  const [selected, setSelected] = useState(DEMO_TODAY);

  const record = DAILY_RECORDS[dateKey(selected)];

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
        Daily report · {RESIDENT_NAME}
      </p>

      <DayStrip days={weekDays} selected={selected} onSelect={setSelected} eventDays={eventDays} />

      {!record ? (
        <p className="text-[14px] font-normal py-8 text-center" style={{ color: FAMILY_MUTED }}>
          No report logged for this day yet.
        </p>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 ${familyCardClass}`}>
            <h3 className="text-[14px] font-medium text-[#1a1a24] mb-3">Meals</h3>
            {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
              const key = meal.toLowerCase();
              const status = record.meals[key] || '—';
              return (
                <div key={meal} className="flex items-center justify-between py-2 border-b border-[#F0EFFB] last:border-0">
                  <span className="text-[15px] font-normal text-[#1a1a24]">{meal}</span>
                  <MealPill status={status} />
                </div>
              );
            })}
            <p className="text-[13px] font-normal mt-3 pt-2" style={{ color: FAMILY_MUTED }}>
              Hydration: <span className="font-medium text-[#1a1a24]">{record.meals.hydration}</span>
            </p>
          </div>

          <div className={`p-4 ${familyCardClass}`}>
            <h3 className="text-[14px] font-medium text-[#1a1a24] mb-3">Mood</h3>
            {!record.mood?.morning && !record.mood?.evening ? (
              <p className="text-[14px] font-normal" style={{ color: FAMILY_MUTED }}>
                Not yet logged
              </p>
            ) : (
              <div className="space-y-2">
                {record.mood.morning ? (
                  <p className="text-[15px] font-normal">
                    <span style={{ color: FAMILY_MUTED }}>Morning · </span>
                    {record.mood.morning.emoji} {record.mood.morning.label}
                  </p>
                ) : null}
                {record.mood.evening ? (
                  <p className="text-[15px] font-normal">
                    <span style={{ color: FAMILY_MUTED }}>Evening · </span>
                    {record.mood.evening.emoji} {record.mood.evening.label}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className={`p-4 ${familyCardClass}`}>
            <h3 className="text-[14px] font-medium text-[#1a1a24] mb-3">Activities</h3>
            {record.activities.length === 0 ? (
              <p className="text-[14px] font-normal" style={{ color: FAMILY_MUTED }}>
                No activities scheduled for this day
              </p>
            ) : (
              <ul className="space-y-2">
                {record.activities.map((a) => (
                  <li key={a.name} className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-normal text-[#1a1a24]">
                      {a.name}
                      <span className="text-[13px] ml-1" style={{ color: FAMILY_MUTED }}>
                        {a.time}
                      </span>
                    </span>
                    <ActivityIcon status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`p-4 ${familyCardClass} border-l-[3px]`}
            style={{ borderLeftColor: FAMILY_ACCENT }}
          >
            <h3 className="text-[14px] font-medium text-[#1a1a24] mb-2">Staff note</h3>
            {record.staffNote ? (
              <p className="text-[15px] font-normal leading-relaxed text-[#1a1a24]">{record.staffNote}</p>
            ) : (
              <p className="text-[14px] font-normal" style={{ color: FAMILY_MUTED }}>
                No notes logged for this day.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
