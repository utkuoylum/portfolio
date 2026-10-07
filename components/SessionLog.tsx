'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  attributionSource,
  clock,
  elapsed,
  formatParams,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from '@/lib/sessionLog';
import { contact } from '@/lib/content';

/** The visitor's own session, as a tracking plan would see it. Newest event first. */
export default function SessionLog() {
  const events = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [seconds, setSeconds] = useState(0);
  const [source, setSource] = useState('Direct');

  useEffect(() => {
    const attributed = attributionSource();
    setSource(attributed === 'direct' ? 'Direct' : attributed);
    const tick = () => setSeconds(elapsed());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="log" data-log>
      <div className="log__head">
        <h3 className="log__title">{contact.logTitle}</h3>
        <p className="log__note">{contact.logNote}</p>
      </div>
      <div className="log__body">
        <dl className="log__summary">
          <div>
            <dt>Events</dt>
            <dd>{events.length}</dd>
          </div>
          <div>
            <dt>Time on page</dt>
            <dd>{clock(seconds).replace(/^0/, '')}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{source}</dd>
          </div>
        </dl>
        <ol className="log__rows" data-lenis-prevent aria-label="Event log">
          {[...events].reverse().map((event) => (
            <li key={event.id} className="log__row">
              <span className="t">{clock(event.t)}</span>
              <span className="n">{event.name}</span>
              <span className="p">{formatParams(event.params)}</span>
            </li>
          ))}
        </ol>
        <noscript>
          <p className="log__empty">{contact.noScript}</p>
        </noscript>
      </div>
    </div>
  );
}
