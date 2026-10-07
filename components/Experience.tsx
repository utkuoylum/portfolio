'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { DESKTOP } from '@/lib/motion';
import { experience } from '@/lib/content';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Roles from now back to 2005. On desktop a sticky odometer rolls to the year of the role in view. */
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [tracking, setTracking] = useState(false);
  const { roles } = experience;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP, () => {
        setTracking(true);
        gsap.utils.toArray<HTMLElement>('.role', root.current).forEach((role, i) => {
          ScrollTrigger.create({
            trigger: role,
            start: 'top 62%',
            end: 'bottom 62%',
            onToggle: (self) => {
              if (self.isActive) setActive(i);
            },
          });
        });
        return () => {
          setTracking(false);
          setActive(0);
        };
      });
    },
    { scope: root },
  );

  const year = String(roles[active].year).split('');

  return (
    <section ref={root} className="experience" id="experience" aria-labelledby="experience-title" data-section="experience">
      <div className="wrap">
        <header className="section-head">
          <h2 className="section-title" id="experience-title">
            {experience.title}
          </h2>
          <p className="section-lede">{experience.lede}</p>
        </header>

        <div className={tracking ? 'exp is-tracking' : 'exp'}>
          <div className="exp__year" aria-hidden="true">
            <div className="odo">
              {year.map((digit, i) => (
                <span key={i} className="odo__digit" style={{ '--d': digit, '--i': i } as CSSProperties}>
                  <span className="odo__strip">
                    {DIGITS.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <ol className="exp__list">
            {roles.map((role, i) => (
              <li key={role.year} className={tracking && i === active ? 'role is-active' : 'role'} data-year={role.year}>
                <p className="role__period">
                  <time dateTime={role.start.datetime}>{role.start.label}</time>
                  {' to '}
                  {role.end === 'now' ? 'now' : <time dateTime={role.end.datetime}>{role.end.label}</time>}
                </p>
                <h3 className="role__title">{role.title}</h3>
                <p className="role__org">{role.org}</p>
                <p className="role__desc">{role.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
