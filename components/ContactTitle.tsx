'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { MOTION } from '@/lib/motion';

/** The closing line rises out of its masks once, mirroring the hero. */
export default function ContactTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const title = ref.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const split = SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'contact-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              { yPercent: 112 },
              {
                yPercent: 0,
                duration: 1.2,
                ease: 'expo.out',
                stagger: 0.09,
                scrollTrigger: { trigger: title, start: 'top 85%', once: true },
              },
            ),
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <h2 ref={ref} className="contact__title display" id="contact-title">
      {text}
    </h2>
  );
}
