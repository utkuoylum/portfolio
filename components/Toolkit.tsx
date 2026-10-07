'use client';

import { Fragment, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MOTION, PHONE } from '@/lib/motion';
import { track } from '@/lib/sessionLog';
import { toolkit, type LayerId } from '@/lib/content';
import Field from './Field';

const layerName = (id: LayerId) => toolkit.layers.find((layer) => layer.id === id)!.name;

/** Five layers as a connected system; the diagram and the spec list highlight each other. */
export default function Toolkit() {
  const root = useRef<HTMLElement>(null);
  const [hot, setHot] = useState<LayerId | null>(null);
  const hovered = useRef(new Set<LayerId>());

  const enter = (id: LayerId) => {
    setHot(id);
    if (!hovered.current.has(id)) {
      hovered.current.add(id);
      track('toolkit_hover', { layer: id });
    }
  };
  const hover = (id: LayerId) => ({ onPointerEnter: () => enter(id), onPointerLeave: () => setHot(null) });
  const hotClass = (base: string, id: LayerId) => (hot === id ? `${base} is-hot` : base);

  // The system assembles, then a signal runs through it while it is in view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION, phone: PHONE }, (context) => {
        const { motion, phone } = context.conditions as { motion: boolean; phone: boolean };
        if (!motion) return;
        const flow = root.current!.querySelector<HTMLElement>('[data-flow]')!;
        const nodes = flow.querySelectorAll('.flow__node, .flow__bus');
        const links = gsap.utils.toArray<HTMLElement>('.flow__link', flow);
        const axis = phone ? 'scaleY' : 'scaleX';
        const shift = phone ? 'yPercent' : 'xPercent';

        const build = gsap.timeline({ paused: true });
        build.fromTo(nodes, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0);
        build.fromTo(
          links,
          { [axis]: 0 },
          { [axis]: 1, duration: 0.5, ease: 'power2.inOut', stagger: 0.1, transformOrigin: phone ? '50% 0%' : '0% 50%' },
          0.3,
        );

        const signal = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8 });
        links.forEach((link, i) => {
          signal.fromTo(link.querySelector('i'), { [shift]: 0 }, { [shift]: 100, duration: 0.6, ease: 'sine.inOut' }, i * 0.55);
        });

        // Whichever way the visitor arrives (including a reload further down), the diagram ends up built.
        ScrollTrigger.create({
          trigger: flow,
          start: 'top 82%',
          end: 'bottom top',
          onEnter: () => {
            build.play();
            signal.play();
          },
          onEnterBack: () => {
            build.play();
            signal.play();
          },
          onLeave: () => {
            build.progress(1);
            signal.pause();
          },
          onLeaveBack: () => signal.pause(),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="toolkit" id="toolkit" aria-labelledby="toolkit-title" data-section="toolkit">
      <Field variant="mesh" />
      <div className="wrap">
        <header className="section-head">
          <h2 className="section-title" id="toolkit-title">
            {toolkit.title}
          </h2>
          <p className="section-lede">{toolkit.lede}</p>
        </header>

        <div className="flow" aria-hidden="true" data-flow>
          <div className="flow__row">
            {toolkit.flow.map((id, i) => (
              <Fragment key={id}>
                {i > 0 && (
                  <div className="flow__link">
                    <i />
                  </div>
                )}
                <div className={hotClass('flow__node', id)} data-layer={id} {...hover(id)}>
                  <span>{layerName(id)}</span>
                </div>
              </Fragment>
            ))}
          </div>
          <div className={hotClass('flow__bus', toolkit.bus)} data-layer={toolkit.bus} {...hover(toolkit.bus)}>
            <span>{layerName(toolkit.bus)}</span>
          </div>
        </div>

        <dl className="specs">
          {toolkit.layers.map((layer) => (
            <div key={layer.id} className={hotClass('spec', layer.id)} data-layer={layer.id} {...hover(layer.id)}>
              <dt>{layer.name}</dt>
              <dd>{layer.tools}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
