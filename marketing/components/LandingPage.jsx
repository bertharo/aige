'use client';

import { useState } from 'react';
import HeroMockup from './HeroMockup';
import {
  IconBell,
  IconCheck,
  IconClipboard,
  IconClock,
  IconHeart,
  IconMicrophone,
  IconSparkles,
  IconUsers,
} from './icons';

const ROLES_HERO = [
  { value: 'family', label: 'Family member' },
  { value: 'operator', label: 'Facility operator' },
];

const ROLES_WAITLIST = [
  { value: 'family', label: 'Family member' },
  { value: 'operator', label: 'Facility operator' },
  { value: 'other', label: 'Other' },
];

function BulletList({ items, icons }) {
  return (
    <ul className="space-y-3.5">
      {items.map((text, i) => {
        const Icon = icons[i];
        return (
          <li key={text} className="flex gap-3 items-start">
            <span className="mt-0.5 shrink-0 text-kinness-accent">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[15px] leading-relaxed text-[#1a1a18]/90">{text}</span>
          </li>
        );
      })}
    </ul>
  );
}

function WaitlistForm({ id, roles, onSuccess, compact = false }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0].value);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, role }),
      });
      const data = await res.json();

      if (data.status === 'success' || data.status === 'already_registered') {
        setSubmitted(true);
        onSuccess?.();
        return;
      }

      setError(data.message || 'Something went wrong. Try again.');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className={`text-[16px] font-medium text-kinness-accent-dark ${compact ? 'py-2' : 'py-6 text-center'}`}>
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  const inputClass =
    'w-full h-11 px-3.5 text-[15px] font-normal bg-white border border-[#E8E7E4] rounded-xl outline-none transition-colors focus:border-kinness-accent text-[#1a1a18] placeholder:text-kinness-muted';

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4 max-w-md mx-auto'}>
      <div className={compact ? 'space-y-3' : 'grid sm:grid-cols-2 gap-3'}>
        <label className="block">
          <span className="sr-only">First name</span>
          <input
            type="text"
            name="firstName"
            required
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            autoComplete="given-name"
            disabled={loading}
          />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
            disabled={loading}
          />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">Role</span>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClass} appearance-none`}
          disabled={loading}
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-11 rounded-xl bg-kinness-accent text-white text-[15px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${compact ? '' : ''}`}
      >
        {loading ? 'Saving...' : compact ? 'Join the waitlist' : 'Get early access'}
      </button>
      {error ? (
        <p className="text-[14px] text-[#A32D2D]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export default function LandingPage() {
  const [heroFormOpen, setHeroFormOpen] = useState(false);

  const staffBullets = [
    'Staff log a daily moment in under 30 seconds',
    'Voice notes auto-transcribed, photos auto-tagged',
    'AI drafts the end-of-day summary — staff reviews and sends',
    'No extra paperwork. No new habits to build.',
  ];

  const familyBullets = [
    'One daily digest: mood, meals, activities, a moment',
    'Configurable alerts for what matters',
    'The whole family sees the same feed — no phone trees',
    'React, message the care team, schedule a visit',
  ];

  const staffIcons = [IconClock, IconMicrophone, IconSparkles, IconClipboard];

  return (
    <div className="min-h-screen">
      {/* ——— Nav ——— */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E7E4]/80">
        <div className="max-w-site mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <a href="#" className="text-[18px] font-medium text-kinness-accent-dark tracking-tight">
            Kiness
          </a>
          <nav className="flex items-center gap-3 sm:gap-5">
            <a
              href="#for-facilities"
              className="text-[13px] sm:text-[14px] font-medium text-kinness-muted hover:text-kinness-accent-dark transition-colors"
            >
              For facilities
            </a>
            <a
              href="/login"
              className="text-[14px] font-medium text-kinness-muted hover:text-kinness-accent-dark transition-colors"
            >
              Sign in
            </a>
            <a
              href="#demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 rounded-xl bg-kinness-accent text-white text-[14px] font-medium transition-opacity hover:opacity-90"
            >
              Book a demo
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* ——— Hero ——— */}
        <section className="max-w-site mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-kinness-accent-light text-kinness-accent-dark text-[12px] font-medium mb-6">
                Now in pilot
              </span>
              <h1 className="font-serif text-[40px] sm:text-[48px] lg:text-[52px] leading-[1.08] text-kinness-accent-dark mb-5">
                Your family, always close.
              </h1>
              <p className="text-[16px] leading-relaxed text-kinness-muted max-w-lg mb-8">
                Kiness connects families to loved ones in assisted living — through daily updates, real moments, and
                the reassurance that someone is watching over them.
              </p>

              {!heroFormOpen ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setHeroFormOpen(true)}
                    className="inline-flex justify-center items-center h-11 px-6 rounded-xl bg-kinness-accent text-white text-[15px] font-medium transition-opacity hover:opacity-90"
                  >
                    Join the waitlist
                  </button>
                  <a
                    href="#demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[15px] font-medium text-kinness-accent hover:opacity-80 transition-opacity"
                  >
                    Book a demo →
                  </a>
                </div>
              ) : (
                <div className="mb-8 p-5 bg-white rounded-2xl border border-[#E8E7E4] max-w-md">
                  <WaitlistForm id="hero" roles={ROLES_HERO} compact />
                </div>
              )}

              <p className="text-[13px] leading-relaxed text-kinness-muted max-w-md">
                Designed with care aides and families. Built for the people who need it most.
              </p>
            </div>

            <div className="lg:pl-4">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ——— Problem ——— */}
        <section className="max-w-site mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center mb-10">
            {[
              { stat: '1.5M', label: 'Americans in nursing homes' },
              { stat: '1×/year', label: 'Average family care conference' },
              { stat: '0', label: 'Products that fix this' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="font-serif text-[36px] sm:text-[40px] text-kinness-accent-dark mb-2">{stat}</p>
                <p className="text-[14px] font-medium text-kinness-muted">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[16px] leading-relaxed text-[#1a1a18]/85 max-w-2xl mx-auto">
            Families are flying blind. Facilities rely on phone calls and paper binders. The daily moments — the smile
            at breakfast, the walk to the garden — disappear. Kiness captures them.
          </p>
        </section>

        {/* ——— How it works ——— */}
        <section className="max-w-site mx-auto px-5 sm:px-8 py-16 sm:py-20 border-t border-[#E8E7E4]">
          <div className="grid md:grid-cols-2 md:divide-x divide-[#E8E7E4] gap-12 md:gap-0">
            <div className="md:pr-10 lg:pr-14">
              <h2 className="font-serif text-[28px] sm:text-[32px] text-kinness-accent-dark mb-6">For care teams</h2>
              <BulletList items={staffBullets} icons={staffIcons} />
            </div>
            <div className="md:pl-10 lg:pl-14">
              <h2 className="font-serif text-[28px] sm:text-[32px] text-kinness-accent-dark mb-6">For families</h2>
              <BulletList items={familyBullets} icons={[IconCheck, IconBell, IconUsers, IconHeart]} />
            </div>
          </div>
        </section>

        {/* ——— Dual audience ——— */}
        <section id="for-facilities" className="max-w-site mx-auto px-5 sm:px-8 py-16 sm:py-20 scroll-mt-16">
          <div className="grid md:grid-cols-2 gap-5">
            <article className="bg-white rounded-2xl border border-[#E8E7E4] p-6 sm:p-8 flex flex-col">
              <span className="inline-block self-start px-2.5 py-1 rounded-full bg-kinness-accent-light text-kinness-accent-dark text-[11px] font-medium uppercase tracking-wide mb-4">
                For operators
              </span>
              <h3 className="font-serif text-[24px] sm:text-[26px] text-kinness-accent-dark mb-3 leading-snug">
                Your transparency is your differentiator.
              </h3>
              <p className="text-[15px] leading-relaxed text-kinness-muted flex-1 mb-6">
                Families choosing between facilities pick the one that keeps them in the loop. Kiness is a selling
                point, a compliance tool, and a complaint-reduction system — all in one.
              </p>
              <a
                href="#demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[15px] font-medium text-kinness-accent hover:opacity-80 transition-opacity"
              >
                Book a demo →
              </a>
            </article>

            <article className="bg-white rounded-2xl border border-[#E8E7E4] p-6 sm:p-8 flex flex-col">
              <span className="inline-block self-start px-2.5 py-1 rounded-full bg-kinness-accent-light text-kinness-accent-dark text-[11px] font-medium uppercase tracking-wide mb-4">
                For families
              </span>
              <h3 className="font-serif text-[24px] sm:text-[26px] text-kinness-accent-dark mb-3 leading-snug">
                Feel present, even from a distance.
              </h3>
              <p className="text-[15px] leading-relaxed text-kinness-muted flex-1 mb-6">
                You can&apos;t always visit. But you can always know. Kiness gives you a real window into your loved
                one&apos;s day — not just &ldquo;they&apos;re doing fine.&rdquo;
              </p>
              <a
                href="#waitlist"
                className="inline-flex items-center text-[15px] font-medium text-kinness-accent hover:opacity-80 transition-opacity"
              >
                Join the waitlist →
              </a>
            </article>
          </div>
        </section>

        {/* ——— Waitlist ——— */}
        <section id="waitlist" className="bg-kinness-accent-light scroll-mt-16">
          <div className="max-w-site mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
            <h2 className="font-serif text-[32px] sm:text-[36px] text-kinness-accent-dark mb-3">Be first.</h2>
            <p className="text-[16px] text-kinness-muted max-w-md mx-auto mb-8">
              Kiness is in pilot. Join the waitlist and we&apos;ll reach out when we&apos;re ready for you.
            </p>
            <WaitlistForm id="footer" roles={ROLES_WAITLIST} />
          </div>
        </section>
      </main>

      {/* ——— Footer ——— */}
      <footer className="bg-white border-t border-[#E8E7E4]">
        <div className="max-w-site mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[16px] font-medium text-kinness-accent-dark mb-1">Kiness</p>
            <p className="text-[14px] text-kinness-muted max-w-xs">
              Kiness — the family connection platform for elder care.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-[13px] font-medium text-kinness-muted hover:text-kinness-accent-dark transition-colors">
                Privacy policy
              </a>
              <a href="#" className="text-[13px] font-medium text-kinness-muted hover:text-kinness-accent-dark transition-colors">
                Terms
              </a>
            </div>
          </div>
          <p className="text-[13px] text-kinness-muted sm:text-right">© 2026 Kiness</p>
        </div>
      </footer>
    </div>
  );
}
