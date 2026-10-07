'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { MOTION, fontsReady } from '@/lib/motion';
import { hero, person } from '@/lib/content';
import Field from './Field';

// Light passes once through the statement (gradient-text-sweep, form A).
function sweep(lines: Element[]) {
  if (!CSS.supports('(-webkit-background-clip: text) or (background-clip: text)')) return;
  lines.forEach((line) => line.classList.add('sheen'));
  gsap.fromTo(
    lines,
    { backgroundPosition: '100% 50%' },
    {
      backgroundPosition: '0% 50%',
      duration: 1.7,
      ease: 'none',
      stagger: 0.14,
      onComplete: () =>
        lines.forEach((line) => {
          line.classList.remove('sheen');
          (line as HTMLElement).style.backgroundPosition = '';
        }),
    },
  );
}

/** One orchestrated entrance, then the hero recedes as the page takes over. */
export default function Hero() {
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      window.__motionReady = true;
      const root = inner.current!;
      const statement = root.querySelector<HTMLElement>('[data-hero-statement]')!;
      const name = root.querySelector('.hero__name');
      const foot = root.querySelector<HTMLElement>('.hero__foot')!;
      const footItems = foot.querySelectorAll('[data-hero-item]');

      const mm = gsap.matchMedia();
      mm.add(MOTION, (context) => {
        let split: SplitText | null = null;
        let alive = true;

        fontsReady(1200).then(() => {
          if (!alive) return;
          context.add(() => {
            split = SplitText.create(statement, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'hero-line',
              autoSplit: true,
              onSplit: (self) =>
                gsap.fromTo(
                  self.lines,
                  { yPercent: 112 },
                  { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.15 },
                ),
            });
            gsap.set(statement, { visibility: 'visible' });

            gsap
              .timeline()
              .fromTo(name, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0)
              .fromTo(foot, { '--draw': 0 }, { '--draw': 1, duration: 1.4, ease: 'expo.out' }, 0.65)
              .fromTo(
                footItems,
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
                0.8,
              )
              .add(() => split && sweep(split.lines), 1.45);
          });
        });

        gsap.to(root, {
          scale: 0.92,
          y: -40,
          autoAlpha: 0,
          transformOrigin: '0% 100%',
          ease: 'none',
          scrollTrigger: { trigger: root.parentElement, start: 'top top', end: 'bottom top', scrub: true },
        });

        return () => {
          alive = false;
          split?.revert();
        };
      });
    },
    { scope: inner },
  );

  return (
    <section className="hero" id="top" data-section="hero">
      <Field variant="lens" />
      <div ref={inner} className="wrap hero__inner" data-hero>
        <h1 className="hero__name" data-hero-item>
          {person.name}
        </h1>
        <p className="hero__statement display" data-hero-statement>
          {hero.statement}
        </p>
        <div className="hero__foot">
          <p className="hero__intro" data-hero-item>
            {hero.intro}
          </p>
          <div className="hero__now" data-hero-item>
            {hero.now.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
