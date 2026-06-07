import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, photoUrl } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  FAMILY_ACCENT,
  FAMILY_ACCENT_LIGHT,
  FAMILY_MUTED,
  FAMILY_TEXT,
  familyCardClass,
  initials,
  staffAvatarColor,
} from './familyTheme';
import './familyStyles.css';

function HeartButton({ liked, count, onToggle }) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1.5 ${animating ? 'family-heart-pop' : ''}`}
      style={{ color: liked ? FAMILY_ACCENT : FAMILY_MUTED, fontSize: '13px' }}
      aria-pressed={liked}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        {liked ? (
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={FAMILY_ACCENT}
          />
        ) : (
          <path
            d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
            fill="none"
            stroke={FAMILY_MUTED}
            strokeWidth="1.5"
          />
        )}
      </svg>
      <span>{count}</span>
    </button>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-white/80 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-white/80 rounded animate-pulse" />
          <div className="h-3 w-36 bg-white/80 rounded animate-pulse" />
        </div>
      </div>
      <div className={`${familyCardClass} p-5 animate-pulse`}>
        <div className="h-4 w-full bg-[#F0EFFB] rounded mb-3" />
        <div className="h-4 w-5/6 bg-[#F0EFFB] rounded mb-3" />
        <div className="h-4 w-2/3 bg-[#F0EFFB] rounded" />
      </div>
    </div>
  );
}

function ResidentHeader({ name, facilityName }) {
  const parts = (name || 'Rosa Haro').split(' ');
  const ini = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
        style={{ backgroundColor: FAMILY_ACCENT_LIGHT, color: FAMILY_ACCENT }}
      >
        {ini}
      </div>
      <div>
        <p className="text-[17px] font-medium leading-tight" style={{ color: FAMILY_TEXT }}>
          {name || 'Rosa Haro'}
        </p>
        <p className="text-[12px] font-normal" style={{ color: FAMILY_MUTED }}>
          {facilityName || 'Sunrise Gardens'}
        </p>
      </div>
    </div>
  );
}

function FeedCard({ item, index, liked, likeCount, onLike }) {
  const staffColor = staffAvatarColor(item.staffName);
  const staffIni = initials(item.staffName);
  const animate = index < 3;

  return (
    <li
      className={`${familyCardClass} border-l-[3px] overflow-hidden${animate ? ' family-feed-card-enter' : ''}`}
      style={{
        borderLeftColor: FAMILY_ACCENT,
        animationDelay: animate ? `${index * 60}ms` : undefined,
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 text-white"
            style={{ backgroundColor: staffColor }}
          >
            {staffIni}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate" style={{ color: FAMILY_TEXT }}>
              {item.staffName}
            </p>
          </div>
          <span className="text-[12px] font-normal shrink-0" style={{ color: FAMILY_MUTED }}>
            {item.timeAgo}
          </span>
        </div>

        <p className="text-[13px] font-medium mb-2" style={{ color: FAMILY_ACCENT }}>
          {item.residentName}
        </p>

        <p
          className="text-[15px] font-normal whitespace-pre-wrap"
          style={{ color: FAMILY_TEXT, lineHeight: 1.7 }}
        >
          {item.content}
        </p>

        {item.photoUrl ? (
          <img
            src={photoUrl(item.photoUrl)}
            alt=""
            className="w-full mt-3 object-cover"
            style={{ borderRadius: '10px', maxHeight: '200px' }}
          />
        ) : null}

        <div className="mt-4 pt-1">
          <HeartButton liked={liked} count={likeCount} onToggle={onLike} />
        </div>
      </div>
    </li>
  );
}

export default function FeedTab({ token, facilityName }) {
  const { t } = useLanguage();
  const [feed, setFeed] = useState([]);
  const [residentName, setResidentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState({});
  const touchStart = useRef(0);
  const pullDistance = useRef(0);

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/family/feed', { token });
      setFeed(data.feed);
      if (data.resident?.name) setResidentName(data.resident.name);
      else if (data.feed?.[0]?.residentName) setResidentName(data.feed[0].residentName);
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
        const parsed = JSON.parse(cached);
        setFeed(parsed);
        if (parsed[0]?.residentName) setResidentName(parsed[0].residentName);
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
    try {
      const saved = localStorage.getItem('kinness_feed_likes');
      if (saved) setLikes(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, [loadFeed]);

  const toggleLike = (id) => {
    setLikes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('kinness_feed_likes', JSON.stringify(next));
      return next;
    });
  };

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
        <p className="text-center text-[12px] mb-2 font-medium" style={{ color: FAMILY_ACCENT }}>
          {t('refreshing')}
        </p>
      ) : null}

      {loading ? <FeedSkeleton /> : null}

      {error ? (
        <p className="text-[15px] mb-3" style={{ color: '#C62828' }} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg width="44" height="44" viewBox="0 0 24 24" fill={FAMILY_ACCENT} aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p className="text-[17px] font-medium mt-4" style={{ color: FAMILY_ACCENT }}>
            No updates yet
          </p>
          <p className="text-[14px] font-normal mt-1" style={{ color: FAMILY_MUTED }}>
            The care team will share {residentName?.split(' ')[0] || 'Rosa'}&apos;s first update soon.
          </p>
        </div>
      ) : null}

      {!loading && feed.length > 0 ? (
        <>
          <ResidentHeader name={residentName} facilityName={facilityName} />
          <ul className="space-y-3">
            {feed.map((item, index) => {
              const liked = Boolean(likes[item.id]);
              const baseCount = item.id.charCodeAt(0) % 3;
              const likeCount = liked ? baseCount + 1 : baseCount;
              return (
                <FeedCard
                  key={item.id}
                  item={item}
                  index={index}
                  liked={liked}
                  likeCount={likeCount}
                  onLike={() => toggleLike(item.id)}
                />
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
