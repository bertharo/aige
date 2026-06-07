import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client';
import { dateKey, getWeekDays } from './familyDateUtils';

const FamilyContext = createContext(null);

export function FamilyProvider({ token, children }) {
  const [residentId, setResidentId] = useState(null);
  const [residentName, setResidentName] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [loadingResident, setLoadingResident] = useState(true);
  const [residentError, setResidentError] = useState('');

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const loadResident = useCallback(async () => {
    setLoadingResident(true);
    setResidentError('');
    try {
      const data = await apiFetch('/api/family/feed', { token });
      if (data.resident?.id) {
        setResidentId(data.resident.id);
        setResidentName(data.resident.name);
      } else if (data.feed?.length > 0) {
        setResidentName(data.feed[0].residentName || '');
      }
    } catch (err) {
      setResidentError(err.message);
    } finally {
      setLoadingResident(false);
    }
  }, [token]);

  useEffect(() => {
    loadResident();
  }, [loadResident]);

  const value = useMemo(
    () => ({
      token,
      residentId,
      residentName,
      selectedDate,
      setSelectedDate,
      selectedDateKey: dateKey(selectedDate),
      weekDays,
      loadingResident,
      residentError,
      retryResident: loadResident,
    }),
    [token, residentId, residentName, selectedDate, weekDays, loadingResident, residentError, loadResident]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
