'use client';

import { useEffect } from 'react';
import { attributionSource, track, type LogParams } from '@/lib/sessionLog';

// Module state, so the counters survive React re-mounting the effect in development.
let pageViewSent = false;
const depthMarks = [25, 50, 75, 90];
const engagedGoals = [30, 60, 120, 300];
const seen = new Set<string>();
let engagedSeconds = 0;

/** Fires the page's own events into the session log. Renders nothing. */
export default function Instrumentation() {
  useEffect(() => {
    if (!pageViewSent) {
      pageViewSent = true;
      const params: LogParams = { page: location.pathname, source: attributionSource() };
      const campaign = new URLSearchParams(location.search).get('utm_campaign');
      if (campaign) params.campaign = campaign;
      track('page_view', params);
    }

    // Scroll depth, once per threshold.
    let ticking = false;
    const depth = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const percent = (window.scrollY / max) * 100;
      while (depthMarks.length && percent >= depthMarks[0]) {
        track('scroll_depth', { percent: `${depthMarks.shift()}%` });
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(depth);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Section and case impressions, once each.
    const impressions = (selector: string, attribute: string, event: string, key: string, rootMargin: string) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = entry.target.getAttribute(attribute) ?? '';
            if (!entry.isIntersecting || seen.has(`${event}:${id}`)) return;
            seen.add(`${event}:${id}`);
            track(event, { [key]: id });
          });
        },
        { rootMargin },
      );
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
      return observer;
    };
    const observers = [
      impressions('[data-section]:not([data-section="hero"])', 'data-section', 'section_view', 'section', '-45% 0px -45% 0px'),
      impressions('article[data-case]', 'data-case', 'case_view', 'case', '-40% 0px -40% 0px'),
    ];

    // Declarative click tracking: data-track="event_name".
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.('[data-track]');
      if (!el) return;
      const name = el.getAttribute('data-track') ?? '';
      const href = el.getAttribute('href') ?? '';
      if (name === 'outbound_click') {
        let destination = '';
        try {
          destination = new URL(href, location.href).hostname.replace(/^www\./, '');
        } catch {
          destination = href;
        }
        track(name, { destination });
      } else if (name === 'nav_click') {
        track(name, { target: href.replace('#', '') || 'top' });
      } else if (name === 'email_click') {
        track(name, { method: 'mailto' });
      } else {
        track(name);
      }
    };
    document.addEventListener('click', onClick);

    // Copying text is a strong intent signal. The copy button's helper field logs nothing.
    const onCopy = (event: ClipboardEvent) => {
      if ((event.target as Element | null)?.closest?.('[data-log-ignore]')) return;
      const text = String(window.getSelection() ?? '');
      if (text) track('text_copy', { characters: text.length });
    };
    document.addEventListener('copy', onCopy);

    // Engaged time counts only while the tab is visible.
    const engagement = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      engagedSeconds += 1;
      if (engagedGoals.length && engagedSeconds >= engagedGoals[0]) {
        track('engaged_time', { seconds: engagedGoals.shift()! });
      }
    }, 1000);

    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = performance.now();
      } else if (hiddenAt) {
        const away = Math.round((performance.now() - hiddenAt) / 1000);
        hiddenAt = 0;
        track('tab_return', { away: `${away}s` });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('scroll', onScroll);
      observers.forEach((observer) => observer.disconnect());
      document.removeEventListener('click', onClick);
      document.removeEventListener('copy', onCopy);
      window.clearInterval(engagement);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
