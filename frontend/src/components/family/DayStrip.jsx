import React, { useRef, useEffect } from 'react';
import { FAMILY_ACCENT, FAMILY_MUTED, FAMILY_TEXT } from './familyTheme';
import { dateKey } from './familyDateUtils';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DayStrip({ days, selected, onSelect, eventDays }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide" style={{ height: '64px' }}>
      <div className="flex gap-1 min-w-min h-full items-center">
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
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] h-[56px]"
              aria-pressed={isActive}
            >
              <span className="text-[12px] font-normal" style={{ color: FAMILY_MUTED }}>
                {LETTERS[i]}
              </span>
              <span
                className="w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-medium transition-colors"
                style={
                  isActive
                    ? { backgroundColor: FAMILY_ACCENT, color: '#fff' }
                    : { color: FAMILY_TEXT }
                }
              >
                {day.getDate()}
              </span>
              <span
                className="rounded-full"
                style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: hasEvents ? FAMILY_ACCENT : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
