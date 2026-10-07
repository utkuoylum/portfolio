'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { MOTION } from '@/lib/motion';
import { profile } from '@/lib/content';
import Field from './Field';

/** The paragraph fills word by word as it is read. */
export default function Profile() {
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = text.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const split = SplitText.create(el, {
          type: 'words',
          wordsClass: 'fill-word',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 },
              },
            ),
        });
        return () => split.revert();
      });
    },
    { scope: text },
  );

  return (
    <section className="profile" id="profile" aria-labelledby="profile-title" data-section="profile">
      <Field variant="scan" />
      <div className="wrap">
        <h2 className="visually-hidden" id="profile-title">
          Profile
        </h2>
        <p ref={text} className="statement" data-fill>
          {profile}
        </p>
      </div>
    </section>
  );
}
