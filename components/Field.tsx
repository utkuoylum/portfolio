'use client';

import { useEffect, useRef } from 'react';
import { mountField, type FieldVariant } from '@/lib/field';
import { MOTION } from '@/lib/motion';

// Phones, reduced motion and no-JS keep the static dot grid drawn in CSS.
const LIVE = `${MOTION} and (min-width: 700px)`;

/** A barely visible pattern behind its section. Place it as the section's first child. */
export default function Field({ variant }: { variant: FieldVariant }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const section = el.parentElement as HTMLElement;
    const canvas = el.querySelector('canvas')!;
    const query = window.matchMedia(LIVE);
    let unmount: (() => void) | null = null;

    const sync = () => {
      if (query.matches && !unmount) {
        unmount = mountField(section, canvas, variant);
        el.classList.add('is-live');
      } else if (!query.matches && unmount) {
        unmount();
        unmount = null;
        el.classList.remove('is-live');
      }
    };
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      unmount?.();
      el.classList.remove('is-live');
    };
  }, [variant]);

  return (
    <div ref={host} className="field" data-field={variant} aria-hidden="true">
      <canvas />
    </div>
  );
}
