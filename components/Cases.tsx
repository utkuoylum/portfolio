'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { DESKTOP, MOTION } from '@/lib/motion';
import { schematic } from '@/lib/schematic';
import { useMatchMedia } from '@/lib/useMatchMedia';
import type { CaseItem } from '@/lib/content';
import { Schematic } from './schematics';

/**
 * Desktop: sticky media. The text scrolls while one stage beside it shows the schematic
 * of the case in focus. Phones and no-JS: each schematic sits inline above its case.
 */
export default function Cases({ items }: { items: CaseItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const desktop = useMatchMedia(DESKTOP);
  const motion = useMatchMedia(MOTION);

  useGSAP(
    () => {
      const container = root.current!;
      const articles = gsap.utils.toArray<HTMLElement>('[data-case]', container);
      const svgs = gsap.utils.toArray<SVGSVGElement>(desktop ? '.stage__fig .schem' : '.case__figure .schem', container);
      const figures = svgs.map((svg) => svg.parentElement as HTMLElement);
      const schems = svgs.map((svg) => schematic(svg, motion));

      if (desktop) {
        let active = -1;
        gsap.set(figures, { autoAlpha: 0 });

        const activate = (i: number) => {
          if (i === active) return;
          const prev = active;
          active = i;
          articles.forEach((article, k) => article.classList.toggle('is-active', k === i));
          if (prev >= 0) {
            schems[prev].pause();
            if (motion) gsap.to(figures[prev], { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.in', overwrite: true });
            else gsap.set(figures[prev], { autoAlpha: 0 });
          }
          if (motion) {
            gsap.fromTo(
              figures[i],
              { autoAlpha: 0, y: 18 },
              { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: prev >= 0 ? 0.2 : 0, overwrite: true },
            );
          } else {
            gsap.set(figures[i], { autoAlpha: 1, y: 0 });
          }
          schems[i].start();
        };

        ScrollTrigger.create({
          trigger: container,
          start: 'top 75%',
          onEnter: () => {
            if (active < 0) activate(0);
          },
        });
        articles.forEach((article, i) => {
          ScrollTrigger.create({
            trigger: article,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) activate(i);
            },
          });
        });
        // Loops rest while the section is off screen.
        const rest = () => active >= 0 && schems[active].pause();
        const wake = () => active >= 0 && schems[active].resume();
        ScrollTrigger.create({
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          onLeave: rest,
          onLeaveBack: rest,
          onEnter: wake,
          onEnterBack: wake,
        });
        // The stage just changed the layout of the whole section.
        ScrollTrigger.refresh();
      } else {
        figures.forEach((fig, i) => {
          let started = false;
          ScrollTrigger.create({
            trigger: fig,
            start: 'top 85%',
            end: 'bottom 10%',
            onToggle: (self) => {
              if (!self.isActive) schems[i].pause();
              else if (!started) {
                started = true;
                schems[i].start();
              } else schems[i].resume();
            },
          });
        });
      }

      return () => {
        schems.forEach((s) => s.dispose());
        articles.forEach((article) => article.classList.remove('is-active'));
      };
    },
    { scope: root, dependencies: [desktop, motion], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={desktop ? 'cases has-stage' : 'cases'} data-cases>
      <div className="cases__list">
        {items.map((item) => (
          <article key={item.id} className="case" data-case={item.id}>
            <figure className={item.grid ? 'case__figure case__figure--grid' : 'case__figure'} aria-hidden="true">
              <Schematic kind={item.id} />
            </figure>
            <p className="case__meta">{item.meta}</p>
            <h3 className="case__title">{item.title}</h3>
            <p className="case__body">{item.body}</p>
            <p className="case__stack">{item.stack}</p>
          </article>
        ))}
      </div>
      <div className="cases__stage" aria-hidden="true">
        {desktop && (
          <>
            <div className="stage__panel" />
            {items.map((item) => (
              <div key={item.id} className={item.grid ? 'stage__fig stage__fig--grid' : 'stage__fig'}>
                <Schematic kind={item.id} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
