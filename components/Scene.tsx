'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION } from '@/lib/motion';

type Props = { id: string; className: string; labelledBy: string; children: ReactNode };

/** An inverted section that opens from an inset, rounded frame to full bleed as it scrolls in. */
export default function Scene({ id, className, labelledBy, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.fromTo(
          ref.current,
          { clipPath: 'inset(0% 3% 0% 3% round 48px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 20%', scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id={id} className={`scene ${className}`} aria-labelledby={labelledBy} data-section={id} data-scene>
      {children}
    </section>
  );
}
