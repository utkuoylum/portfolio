'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { motionOK, press } from '@/lib/motion';
import { track } from '@/lib/sessionLog';

const IDLE = 'Copy email';

function fallbackCopy(value: string): boolean {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  // The copy button logs its own event; the session log ignores this helper.
  area.setAttribute('data-log-ignore', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

async function copyText(value: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return fallbackCopy(value);
    }
  }
  return fallbackCopy(value);
}

export default function CopyEmail({ email }: { email: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(0);
  const [label, setLabel] = useState(IDLE);
  const [done, setDone] = useState(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    if (motionOK() && button.current) {
      gsap.fromTo(button.current, { scale: 0.94 }, { scale: 1, duration: press.duration, ease: press.ease });
    }
    const ok = await copyText(email);
    setLabel(ok ? 'Copied' : 'Copy failed, select the address instead');
    setDone(ok);
    if (ok) track('email_copy', { method: 'button' });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setLabel(IDLE);
      setDone(false);
    }, 2400);
  };

  return (
    <button ref={button} className={done ? 'pill is-done' : 'pill'} type="button" onClick={onClick}>
      <span className="pill__label" aria-live="polite">
        {label}
      </span>
    </button>
  );
}
