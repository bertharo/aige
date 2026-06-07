import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client';
import DayStrip from './DayStrip';
import { useFamily } from './FamilyContext';
import { dateKey, daysWithCalendarDots } from './familyDateUtils';
import {
  FAMILY_ACCENT,
  FAMILY_ACCENT_LIGHT,
  FAMILY_MUTED,
  FAMILY_NOTE_BG,
  FAMILY_TEXT,
  familyCardClass,
} from './familyTheme';

const MEAL_LABELS = {
  ate_well: 'Ate well',
  partial: 'Partial',
  skipped: 'Skipped',
};

const MEAL_STYLES = {
  'Ate well': { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  Partial: { bg: '#FFF8E1', text: '#F57F17', dot: '#FFC107' },
  Skipped: { bg: '#FFEBEE', text: '#C62828', dot: '#EF5350' },
  '—': { bg: '#F5F5F5', text: '#9E9E9E', dot: '#9E9E9E' },
};

const HYDRATION_STYLES = {
  good: { label: 'Good', ...MEAL_STYLES['Ate well'] },
  fair: { label: 'Fair', ...MEAL_STYLES.Partial },
  low: { label: 'Low', ...MEAL_STYLES.Skipped },
};

const MOOD_LABELS = {
  good: { emoji: '😊', label: 'Good' },
  okay: { emoji: '😐', label: 'Okay' },
  low: { emoji: '😔', label: 'Low' },
  tired: { emoji: '😴', label: 'Tired' },
};

function StatusPill({ label, style }) {
  const s = style || MEAL_STYLES['—'];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        fontSize: '12px',
        borderRadius: '8px',
        padding: '4px 6px',
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{ width: '6px', height: '6px', backgroundColor: s.dot }}
      />
      {label}
    </span>
  );
}

function ActivityIcon({ status }) {
  if (status === 'attended') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={FAMILY_ACCENT} aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    );
  }
  if (status === 'missed') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF5350" aria-hidden>
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={FAMILY_MUTED} strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function PulseCard() {
  return (
    <div className={`p-4 ${familyCardClass} animate-pulse`}>
      <div className="h-20 bg-[#F0EFFB] rounded-lg" />
    </div>
  );
}

function formatHeaderDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function possessiveFirst(name) {
  const first = (name || 'Mary').split(' ')[0];
  return first.endsWith('s') ? `${first}'` : `${first}'s`;
}

export default function FamilyDailyRecordTab() {
  const {
    token,
    residentId,
    residentName,
    selectedDate,
    setSelectedDate,
    selectedDateKey,
    weekDays,
    loadingResident,
    residentError,
    retryResident,
  } = useFamily();

  const [record, setRecord] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const eventDays = useMemo(
    () => daysWithCalendarDots(weekDays, schedules, visits),
    [weekDays, schedules, visits]
  );

  const todayKey = dateKey(new Date());

  const activityRows = useMemo(() => {
    const attended = new Set(record?.activities_attended || []);
    const dow = selectedDate.getDay();
    const daySchedules = schedules.filter((s) => s.day_of_week === dow);
    const isPast = selectedDateKey < todayKey;
    const isFuture = selectedDateKey > todayKey;

    if (daySchedules.length > 0) {
      return daySchedules.map((s) => ({
        name: s.title,
        time: s.start_time,
        status: isFuture ? 'upcoming' : attended.has(s.title) ? 'attended' : isPast ? 'missed' : 'upcoming',
      }));
    }
    return (record?.activities_attended || []).map((name) => ({
      name,
      time: '',
      status: 'attended',
    }));
  }, [record, schedules, selectedDate, selectedDateKey, todayKey]);

  const loadCalendarMeta = useCallback(async () => {
    if (!residentId) return;
    try {
      const data = await apiFetch(`/api/calendar/${residentId}`, { token });
      setSchedules(data.schedules || []);
      setVisits(data.visits || []);
    } catch {
      /* optional */
    }
  }, [residentId, token]);

  const loadRecord = useCallback(async () => {
    if (!residentId) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/daily-record/${residentId}/${selectedDateKey}`, { token });
      setRecord(data);
    } catch (err) {
      setError(err.message);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [residentId, selectedDateKey, token]);

  useEffect(() => {
    loadCalendarMeta();
  }, [loadCalendarMeta]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  if (loadingResident) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-white/70 rounded animate-pulse" />
        <div className="h-16 bg-white/70 rounded-xl animate-pulse" />
        <PulseCard />
      </div>
    );
  }

  if (residentError) {
    return (
      <div className="text-center py-8">
        <p className="text-[14px] mb-3" style={{ color: '#C62828' }}>
          {residentError}
        </p>
        <button type="button" onClick={retryResident} className="text-[14px] font-medium" style={{ color: FAMILY_ACCENT }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <header className="mb-1">
        <h1 className="text-[20px] font-medium" style={{ color: FAMILY_TEXT }}>
          {possessiveFirst(residentName)} Day
        </h1>
        <p className="text-[13px] font-normal mt-0.5" style={{ color: FAMILY_MUTED }}>
          {formatHeaderDate(selectedDate)}
        </p>
      </header>

      <DayStrip days={weekDays} selected={selectedDate} onSelect={setSelectedDate} eventDays={eventDays} />

      {error ? (
        <div className="text-center py-4">
          <p className="text-[14px] mb-2" style={{ color: '#C62828' }}>
            {error}
          </p>
          <button type="button" onClick={loadRecord} className="text-[14px] font-medium" style={{ color: FAMILY_ACCENT }}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <PulseCard />
          <PulseCard />
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 ${familyCardClass}`}>
            {['breakfast', 'lunch', 'dinner'].map((meal, i) => {
              const label = record?.[meal] ? MEAL_LABELS[record[meal]] : '—';
              return (
                <div
                  key={meal}
                  className="flex items-center justify-between py-2.5"
                  style={i < 2 ? { borderBottom: '0.5px solid #F0EFFB' } : undefined}
                >
                  <span className="text-[14px] font-medium capitalize" style={{ color: FAMILY_TEXT }}>
                    {meal}
                  </span>
                  <StatusPill label={label} style={MEAL_STYLES[label]} />
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: '0.5px solid #F0EFFB' }}>
              <span className="text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
                Hydration
              </span>
              {record?.hydration ? (
                <StatusPill
                  label={HYDRATION_STYLES[record.hydration].label}
                  style={HYDRATION_STYLES[record.hydration]}
                />
              ) : (
                <StatusPill label="—" />
              )}
            </div>
          </div>

          <div className={`p-4 ${familyCardClass}`}>
            {['mood_morning', 'mood_evening'].map((key, i) => {
              const period = key === 'mood_morning' ? 'Morning' : 'Evening';
              const val = record?.[key];
              const mood = val ? MOOD_LABELS[val] : null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between min-h-[40px]"
                  style={i === 0 ? { borderBottom: '0.5px solid #F0EFFB' } : undefined}
                >
                  <span className="text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
                    {period}
                  </span>
                  {mood ? (
                    <span className="flex items-center gap-2">
                      <span style={{ fontSize: '20px', lineHeight: 1 }}>{mood.emoji}</span>
                      <span className="text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
                        {mood.label}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[14px] font-normal italic" style={{ color: FAMILY_MUTED }}>
                      Not yet logged
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`p-4 ${familyCardClass}`}>
            {activityRows.length === 0 ? (
              <p className="text-[14px] font-normal" style={{ color: FAMILY_MUTED }}>
                No activities logged for this day
              </p>
            ) : (
              <ul>
                {activityRows.map((a, i) => (
                  <li
                    key={a.name}
                    className="flex items-center gap-3 min-h-[40px] py-1"
                    style={i < activityRows.length - 1 ? { borderBottom: '0.5px solid #F0EFFB' } : undefined}
                  >
                    <ActivityIcon status={a.status} />
                    <span className="flex-1 text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
                      {a.name}
                    </span>
                    {a.time ? (
                      <span className="text-[12px] font-normal" style={{ color: FAMILY_MUTED }}>
                        {a.time}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`p-4 ${familyCardClass} border-l-[3px]`}
            style={{ borderLeftColor: FAMILY_ACCENT, backgroundColor: FAMILY_NOTE_BG }}
          >
            <h3
              className="text-[13px] font-medium uppercase tracking-wide mb-2"
              style={{ color: FAMILY_MUTED }}
            >
              Today&apos;s note
            </h3>
            {record?.staff_note ? (
              <p className="text-[15px] font-normal" style={{ color: FAMILY_TEXT, lineHeight: 1.7 }}>
                {record.staff_note}
              </p>
            ) : (
              <p className="text-[14px] font-normal italic" style={{ color: FAMILY_MUTED }}>
                No notes logged yet today.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
