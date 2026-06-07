import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client';
import DayStrip from './DayStrip';
import VisitScheduleModal from './VisitScheduleModal';
import { useFamily } from './FamilyContext';
import { dateKey, daysWithCalendarDots } from './familyDateUtils';
import {
  FAMILY_ACCENT,
  FAMILY_ACCENT_LIGHT,
  FAMILY_MUTED,
  FAMILY_TEXT,
  familyCardClass,
} from './familyTheme';

function AttendancePill({ status }) {
  if (!status || status === 'Scheduled') return null;
  const styles = {
    Attended: { bg: FAMILY_ACCENT_LIGHT, color: FAMILY_ACCENT },
    Missed: { bg: '#FFEBEE', color: '#C62828' },
  };
  const s = styles[status];
  if (!s) return null;
  return (
    <span
      className="text-[12px] font-medium shrink-0"
      style={{ backgroundColor: s.bg, color: s.color, borderRadius: '8px', padding: '4px 8px' }}
    >
      {status}
    </span>
  );
}

function FacilityCard({ event }) {
  return (
    <div
      className="flex items-start gap-3 p-3 bg-white"
      style={{
        borderRadius: '12px',
        border: '0.5px solid rgba(91, 79, 232, 0.08)',
        borderLeft: `2px solid ${FAMILY_ACCENT}`,
      }}
    >
      <p className="text-[13px] font-medium w-16 shrink-0 pt-0.5" style={{ color: FAMILY_ACCENT }}>
        {event.time}
      </p>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
          {event.name}
        </p>
        <p className="text-[12px] font-normal mt-0.5" style={{ color: FAMILY_MUTED }}>
          {event.location}
        </p>
      </div>
      <AttendancePill status={event.status} />
    </div>
  );
}

function FamilyVisitCard({ visit, selectedDate }) {
  const timeLabel = visit.time?.charAt(0).toUpperCase() + visit.time?.slice(1);
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const isConfirmed = visit.status === 'Confirmed';

  return (
    <div
      className="flex items-center gap-3 p-3 bg-white"
      style={{
        borderRadius: '12px',
        border: '0.5px solid rgba(91, 79, 232, 0.08)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: FAMILY_ACCENT_LIGHT }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={FAMILY_ACCENT} aria-hidden>
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium" style={{ color: FAMILY_TEXT }}>
          {visit.visitor}
        </p>
        <p className="text-[12px] font-normal mt-0.5" style={{ color: FAMILY_MUTED }}>
          {dayName}, {timeLabel?.toLowerCase()}
        </p>
      </div>
      {isConfirmed ? (
        <span
          className="text-[12px] font-medium shrink-0"
          style={{
            backgroundColor: FAMILY_ACCENT,
            color: '#fff',
            borderRadius: '8px',
            padding: '4px 10px',
          }}
        >
          Confirmed
        </span>
      ) : (
        <span
          className="text-[12px] font-medium shrink-0"
          style={{
            backgroundColor: FAMILY_ACCENT_LIGHT,
            color: FAMILY_ACCENT,
            borderRadius: '8px',
            padding: '4px 10px',
          }}
        >
          {visit.status}
        </span>
      )}
    </div>
  );
}

function SkeletonCard() {
  return <div className={`h-16 ${familyCardClass} animate-pulse bg-white`} />;
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: FAMILY_ACCENT_LIGHT }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={FAMILY_ACCENT} aria-hidden>
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10z" />
        </svg>
      </div>
      <p className="text-[14px] font-normal" style={{ color: FAMILY_MUTED }}>
        Nothing scheduled
      </p>
      <p className="text-[13px] font-normal italic mt-1" style={{ color: FAMILY_MUTED }}>
        A quiet day.
      </p>
    </div>
  );
}

function possessiveFirst(name) {
  const first = (name || 'Rosa').split(' ')[0];
  return first.endsWith('s') ? `${first}'` : `${first}'s`;
}

export default function FamilyCalendarTab({ userName }) {
  const {
    token,
    residentId,
    residentName,
    selectedDate,
    setSelectedDate,
    weekDays,
    loadingResident,
    residentError,
    retryResident,
  } = useFamily();

  const [schedules, setSchedules] = useState([]);
  const [visits, setVisits] = useState([]);
  const [dayEvents, setDayEvents] = useState({ facility: [], family: [] });
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const eventDays = useMemo(
    () => daysWithCalendarDots(weekDays, schedules, visits),
    [weekDays, schedules, visits]
  );

  const loadCalendar = useCallback(async () => {
    if (!residentId) return;
    setLoadingCalendar(true);
    setError('');
    try {
      const data = await apiFetch(`/api/calendar/${residentId}`, { token });
      setSchedules(data.schedules || []);
      setVisits(data.visits || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCalendar(false);
    }
  }, [residentId, token]);

  const loadDayEvents = useCallback(async () => {
    if (!residentId) return;
    setLoadingDay(true);
    try {
      const key = dateKey(selectedDate);
      const data = await apiFetch(`/api/calendar-events/${residentId}/${key}`, { token });
      setDayEvents({ facility: data.facility || [], family: data.family || [] });
    } catch {
      setDayEvents({ facility: [], family: [] });
    } finally {
      setLoadingDay(false);
    }
  }, [residentId, selectedDate, token]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    loadDayEvents();
  }, [loadDayEvents]);

  const handleVisitSubmitted = (newVisit) => {
    if (newVisit) setVisits((prev) => [...prev, newVisit]);
    setConfirmation('Visit request sent. The facility will confirm within 24 hours.');
  };

  if (loadingResident) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-36 bg-white/70 rounded animate-pulse" />
        <div className="h-16 bg-white/70 rounded-xl animate-pulse" />
        <SkeletonCard />
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

  const isEmptyDay = !loadingCalendar && !loadingDay && dayEvents.facility.length === 0 && dayEvents.family.length === 0;

  return (
    <div className="space-y-3 flex flex-col min-h-0">
      <header>
        <h1 className="text-[20px] font-medium" style={{ color: FAMILY_TEXT }}>
          {possessiveFirst(residentName)} Week
        </h1>
      </header>

      <DayStrip days={weekDays} selected={selectedDate} onSelect={setSelectedDate} eventDays={eventDays} />

      {confirmation ? (
        <p
          className="text-[14px] font-medium px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: FAMILY_ACCENT_LIGHT, color: FAMILY_ACCENT }}
        >
          {confirmation}
        </p>
      ) : null}

      {error ? (
        <div className="text-center py-4">
          <p className="text-[14px] mb-2" style={{ color: '#C62828' }}>
            {error}
          </p>
          <button type="button" onClick={loadCalendar} className="text-[14px] font-medium" style={{ color: FAMILY_ACCENT }}>
            Retry
          </button>
        </div>
      ) : null}

      {loadingCalendar || loadingDay ? (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isEmptyDay ? (
        <EmptyDay />
      ) : (
        <>
          {dayEvents.facility.length > 0 ? (
            <section>
              <h3
                className="text-[12px] font-medium uppercase tracking-wide mb-2"
                style={{ color: FAMILY_MUTED }}
              >
                At the facility
              </h3>
              <div className="space-y-2">
                {dayEvents.facility.map((e) => (
                  <FacilityCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          ) : null}

          {dayEvents.family.length > 0 ? (
            <section>
              <h3
                className="text-[12px] font-medium uppercase tracking-wide mb-2"
                style={{ color: FAMILY_MUTED }}
              >
                Family visits
              </h3>
              <div className="space-y-2">
                {dayEvents.family.map((v) => (
                  <FamilyVisitCard key={v.id} visit={v} selectedDate={selectedDate} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <div className="pt-2 mt-auto">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!residentId}
          className="w-full text-[14px] font-medium text-white disabled:opacity-50"
          style={{
            backgroundColor: FAMILY_ACCENT,
            borderRadius: '12px',
            height: '48px',
          }}
        >
          + Schedule a visit
        </button>
      </div>

      <VisitScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        residentId={residentId}
        token={token}
        onSubmitted={handleVisitSubmitted}
      />
    </div>
  );
}
