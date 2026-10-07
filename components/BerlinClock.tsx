'use client';

import { useEffect, useState } from 'react';

const format = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);

/** Local time in Berlin, with the right CET/CEST label. Filled in after mount. */
export default function BerlinClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  return <time dateTime={now?.toISOString()}>{now ? format(now) : 'local time'}</time>;
}
