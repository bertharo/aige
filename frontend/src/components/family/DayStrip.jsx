import React, { useRef, useEffect } from 'react';
import { FAMILY_ACCENT, FAMILY_MUTED } from './familyTheme';
import { dateKey } from './familyPlaceholderData';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DayStrip({ days, selected, onSelect, eventDays }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-hide">
      <div className="flex gap-2 min-w-min">
        {days.map((day, i) => {
          const key = dateKey(day);
          const isActive = dateKey(selected) === key;
          const hasEvents = eventDays?.has(key);

          return (
            <button
              key={key}
              ref={isActive ? activeRef : null}
              type="button"
              onClick={() => onSelect(day)}
              className="flex flex-col items-center gap-1 min-w-[44px] py-1"
              aria-pressed={isActive}
            >
              <span className="text-[11px] font-normal" style={{ color: FAMILY_MUTED }}>
                {LETTERS[i]}
              </span>
              <span
                className="w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-medium transition-colors"
                style={
                  isActive
                    ? { backgroundColor: FAMILY_ACCENT, color: '#fff' }
                    : { color: '#1a1a24' }
                }
              >
                {day.getDate()}
              </span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hasEvents ? FAMILY_ACCENT : 'transparent' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
