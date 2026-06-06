import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useAdminDark } from '../components/admin/AdminShell';
import { apiFetch, photoUrl } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import { ACCENT, glassPanel } from '../theme';

function FeedContent({ user, token }) {
  const { t } = useLanguage();
  const dark = useAdminDark();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const touchStart = useRef(0);
  const pullDistance = useRef(0);

  const muted = dark ? 'text-white/55' : 'text-black/50';
  const body = dark ? 'text-white/90' : 'text-[#0a0a0a]';

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
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {refreshing ? (
        <p className="text-center text-[13px] mb-2 font-medium" style={{ color: ACCENT }}>
          {t('refreshing')}
        </p>
      ) : null}

      {loading ? <p className={`text-[15px] ${muted}`}>{t('loading')}</p> : null}
      {error ? (
        <p className="text-[15px] text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && feed.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className={`text-[17px] ${muted}`}>{t('noUpdates')}</p>
        </div>
      ) : null}

      <ul className="space-y-3">
        {feed.map((item) => (
          <li
            key={item.id}
            className={`overflow-hidden ${glassPanel(dark)} ${
              item.unread ? 'border-l-[3px]' : ''
            }`}
            style={item.unread ? { borderLeftColor: ACCENT } : undefined}
          >
            <div className="p-3.5">
              <div className="flex items-center gap-3 mb-2.5">
                {item.residentPhotoUrl ? (
                  <img
                    src={photoUrl(item.residentPhotoUrl)}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover"
                    style={{ boxShadow: `0 0 0 2px ${ACCENT}` }}
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-semibold"
                    style={{ background: 'rgba(90, 79, 247, 0.15)', color: ACCENT }}
                  >
                    {item.residentName?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className={`font-medium text-[15px] ${body}`}>{item.residentName}</p>
                  <p className={`text-[13px] ${muted}`}>
                    {item.staffName} · {item.timeAgo}
                  </p>
                </div>
              </div>
              <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${body}`}>{item.content}</p>
            </div>
            {item.photoUrl ? (
              <img src={photoUrl(item.photoUrl)} alt="" className="w-full max-h-72 object-cover" />
            ) : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => loadFeed(true)}
        className="mt-5 w-full min-h-[44px] text-[14px] font-medium"
        style={{ color: ACCENT }}
      >
        {t('pullRefresh')}
      </button>
    </div>
  );
}

export default function FamilyFeed({ user, token, onLogout }) {
  const { t } = useLanguage();

  return (
    <Layout user={user} onLogout={onLogout} title={t('familyFeed')}>
      <FeedContent user={user} token={token} />
    </Layout>
  );
}
