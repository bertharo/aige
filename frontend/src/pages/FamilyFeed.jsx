import React, { useState } from 'react';
import FamilyShell from '../components/family/FamilyShell';
import FeedTab from '../components/family/FeedTab';
import FamilyCalendarTab from '../components/family/FamilyCalendarTab';
import FamilyDailyRecordTab from '../components/family/FamilyDailyRecordTab';
import FamilyPhotosTab from '../components/family/FamilyPhotosTab';

export default function FamilyFeed({ user, token, onLogout }) {
  const [tab, setTab] = useState('feed');
  const userName = user?.name || 'Jenny Chen';

  return (
    <FamilyShell activeTab={tab} onTabChange={setTab} onLogout={onLogout}>
      {tab === 'feed' ? <FeedTab token={token} /> : null}
      {tab === 'calendar' ? <FamilyCalendarTab userName={userName} /> : null}
      {tab === 'record' ? <FamilyDailyRecordTab /> : null}
      {tab === 'photos' ? <FamilyPhotosTab /> : null}
    </FamilyShell>
  );
}
