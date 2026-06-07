import React, { useMemo, useState } from 'react';
import DayStrip from './DayStrip';
import VisitScheduleModal from './VisitScheduleModal';
import {
  CALENDAR_EVENTS,
  DEMO_TODAY,
  RESIDENT_NAME,
  dateKey,
  daysWithCalendarEvents,
  getWeekDays,
} from './familyPlaceholderData';
import { FAMILY_ACCENT, FAMILY_MUTED, familyCardClass } from './familyTheme';

function StatusPill({ status }) {
  const styles = {
    Attended: 'bg-emerald-50 text-emerald-700',
    Scheduled: 'bg-gray-100 text-gray-600',
    Missed: 'bg-red-50 text-red-600',
    Confirmed: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
  };
  if (!status) return null;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function FacilityCard({ event }) {
  return (
    <div className={`p-3.5 ${familyCardClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
            {event.time}
          </p>
          <p className="text-[15px] font-medium text-[#1a1a24] mt-0.5">{event.name}</p>
          <p className="text-[13px] font-normal mt-0.5" style={{ color: FAMILY_MUTED }}>
            {event.location}
          </p>
        </div>
        <StatusPill status={event.status} />
      </div>
    </div>
  );
}

function FamilyVisitCard({ visit }) {
  return (
    <div className={`p-3.5 ${familyCardClass} border-l-[3px]`} style={{ borderLeftColor: FAMILY_ACCENT }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-medium text-[#1a1a24]">
            {visit.visitor} · {visit.relationship}
          </p>
          <p className="text-[13px] font-normal mt-0.5" style={{ color: FAMILY_MUTED }}>
            {visit.time} · {visit.duration}
          </p>
        </div>
        <StatusPill status={visit.status} />
      </div>
    </div>
  );
}

export default function FamilyCalendarTab({ userName }) {
  const weekDays = useMemo(() => getWeekDays(DEMO_TODAY), []);
  const eventDays = useMemo(() => daysWithCalendarEvents(weekDays), [weekDays]);
  const [selected, setSelected] = useState(DEMO_TODAY);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const key = dateKey(selected);
  const dayEvents = CALENDAR_EVENTS[key] || { facility: [], family: [] };

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-normal" style={{ color: FAMILY_MUTED }}>
        {RESIDENT_NAME}&apos;s schedule
      </p>

      <DayStrip days={weekDays} selected={selected} onSelect={setSelected} eventDays={eventDays} />

      {confirmation ? (
        <p className="text-[14px] font-medium px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#EEEDFE', color: FAMILY_ACCENT }}>
          {confirmation}
        </p>
      ) : null}

      <section>
        <h3 className="text-[12px] font-medium uppercase tracking-wide mb-2" style={{ color: FAMILY_MUTED }}>
          Facility schedule
        </h3>
        {dayEvents.facility.length === 0 ? (
          <p className="text-[14px] font-normal py-4 text-center" style={{ color: FAMILY_MUTED }}>
            Nothing scheduled
          </p>
        ) : (
          <div className="space-y-2">
            {dayEvents.facility.map((e) => (
              <FacilityCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-[12px] font-medium uppercase tracking-wide mb-2" style={{ color: FAMILY_MUTED }}>
          Family visits
        </h3>
        {dayEvents.family.length === 0 ? (
          <p className="text-[14px] font-normal py-4 text-center" style={{ color: FAMILY_MUTED }}>
            No visits booked
          </p>
        ) : (
          <div className="space-y-2">
            {dayEvents.family.map((v) => (
              <FamilyVisitCard key={v.id} visit={v} />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full h-11 rounded-xl text-[15px] font-medium text-white"
        style={{ backgroundColor: FAMILY_ACCENT }}
      >
        + Schedule a visit
      </button>

      <VisitScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        onSubmitted={() =>
          setConfirmation('Visit request sent. The facility will confirm within 24 hours.')
        }
      />
    </div>
  );
}
