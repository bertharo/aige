import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { apiFetch, photoUrl } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

export default function FamilyFeed({ user, token, onLogout }) {
  const { t } = useLanguage();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const touchStart = useRef(0);
  const pullDistance = useRef(0);

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/family/feed', { token });
      setFeed(data.feed);
      localStorage.setItem('kinness_feed_cache', JSON.stringify(data.feed));
      const unreadIds = data.feed.filter((u) => u.unread).map((u) => u.id);
      if (unreadIds.length > 0) {
        await apiFetch('/api/family/feed/read', {
          token,
          method: 'POST',
          body: { updateIds: unreadIds },
        }).catch(() => {});
      }
    } catch (err) {
      const cached = localStorage.getItem('kinness_feed_cache');
      if (cached) {
        setFeed(JSON.parse(cached));
        setError('');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onTouchStart = (e) => {
    if (window.scrollY === 0) touchStart.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (touchStart.current && window.scrollY === 0) {
      pullDistance.current = e.touches[0].clientY - touchStart.current;
    }
  };

  const onTouchEnd = () => {
    if (pullDistance.current > 80) loadFeed(true);
    touchStart.current = 0;
    pullDistance.current = 0;
  };

  return (
    <Layout user={user} onLogout={onLogout} title={t('familyFeed')}>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {refreshing && (
          <p className="text-center text-sm text-kinness-primary mb-2">{t('refreshing')}</p>
        )}

        {loading && <p className="text-base text-kinness-text/70">{t('loading')}</p>}
        {error && <p className="text-red-600 text-base" role="alert">{error}</p>}

        {!loading && feed.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-lg text-kinness-text/80">{t('noUpdates')}</p>
          </div>
        )}

        <ul className="space-y-4">
          {feed.map((item) => (
            <li
              key={item.id}
              className={`bg-white rounded-2xl border border-kinness-accent/60 shadow-sm overflow-hidden ${
                item.unread ? 'border-l-4 border-l-kinness-accent' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {item.residentPhotoUrl ? (
                    <img
                      src={photoUrl(item.residentPhotoUrl)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-kinness-accent"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-kinness-accent flex items-center justify-center text-kinness-primary font-semibold text-lg">
                      {item.residentName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-base text-kinness-text">{item.residentName}</p>
                    <p className="text-sm text-kinness-text/70">
                      {item.staffName} · {item.timeAgo}
                    </p>
                  </div>
                </div>
                <p className="text-base text-kinness-text leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
              {item.photoUrl && (
                <img
                  src={photoUrl(item.photoUrl)}
                  alt=""
                  className="w-full max-h-80 object-cover"
                />
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => loadFeed(true)}
          className="mt-6 w-full min-h-[44px] text-kinness-primary text-base font-medium"
        >
          {t('pullRefresh')}
        </button>
      </div>
    </Layout>
  );
}
