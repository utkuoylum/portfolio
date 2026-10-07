// Animates one case schematic: wires draw, nodes pop, then packets ride the wires.
// A packet is a zero-length dash with round caps travelling along its path.
import { gsap } from './gsap';
import { pop, press } from './motion';

export type Schematic = {
  /** Replay the build from the start, then loop. */
  start(): void;
  /** Continue where it paused. */
  resume(): void;
  pause(): void;
  dispose(): void;
};

const lengths = new WeakMap<Element, number>();
const lengthOf = (el: Element) => lengths.get(el) ?? 0;

function travel(tl: gsap.core.Timeline, path: SVGPathElement, at: number, duration: number, ease = 'power1.inOut') {
  tl.fromTo(path, { strokeDashoffset: 0 }, { strokeDashoffset: -lengthOf(path), duration, ease }, at);
  tl.fromTo(path, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, at);
  tl.to(path, { opacity: 0, duration: 0.2, ease: 'none' }, at + duration - 0.2);
}

export function schematic(svg: SVGSVGElement, motion: boolean): Schematic {
  const kind = svg.dataset.schem;
  const all = <T extends Element>(selector: string) => Array.from(svg.querySelectorAll<T>(selector));
  const wires = all<SVGPathElement>('.wires .ln:not(.ln--dash)');
  const dashed = all<SVGPathElement>('.wires .ln--dash');
  const nodes = all<SVGGElement>('.nodes .node');
  const labels = all<SVGTextElement>(':scope > text');
  const pkts = all<SVGPathElement>('.pkt');
  let reset = () => {};

  wires.forEach((wire) => {
    const length = wire.getTotalLength();
    wire.style.strokeDasharray = `${length} ${length}`;
    lengths.set(wire, length);
  });
  pkts.forEach((pkt) => {
    const length = pkt.getTotalLength();
    pkt.style.strokeDasharray = `0.001 ${length + 40}`;
    lengths.set(pkt, length);
  });

  const build = gsap.timeline({ paused: true });
  if (labels.length) build.fromTo(labels, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0);
  if (nodes.length) {
    build.fromTo(
      nodes,
      { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: 1, duration: pop.duration, ease: pop.ease, stagger: 0.06 },
      0.05,
    );
  }
  if (wires.length) {
    build.fromTo(
      wires,
      { strokeDashoffset: (_i: number, el: Element) => lengthOf(el) },
      { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.06 },
      0.15,
    );
  }
  if (dashed.length) build.fromTo(dashed, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'none' }, 0.7);

  let loop: gsap.core.Timeline | null = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });

  switch (kind) {
    case 'website':
      pkts.forEach((p, i) => travel(loop!, p, i * 0.32, 1.1));
      break;

    case 'attribution':
      // The classification fills in once the card is on screen.
      build.fromTo(
        all('.attr-val'),
        { autoAlpha: 0, x: 8 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.18 },
        0.75,
      );
      travel(loop, pkts[0], 0, 2.2, 'none');
      travel(loop, pkts[1], 0.6, 1.8, 'none');
      travel(loop, pkts[2], 1.2, 2.2, 'none');
      loop.repeatDelay(0.4);
      break;

    case 'geo-roadmap': {
      // One signal circles the ring; each phase lights up as it arrives.
      const ring = pkts[0];
      const lap = 6;
      loop.set(ring, { opacity: 1 }, 0);
      loop.fromTo(ring, { strokeDashoffset: 0 }, { strokeDashoffset: -lengthOf(ring), duration: lap, ease: 'none' }, 0);
      nodes.forEach((node, i) => {
        loop!.call(() => nodes.forEach((n, k) => n.classList.toggle('is-on', k === i)), undefined, (i / nodes.length) * lap);
      });
      loop.repeatDelay(0);
      break;
    }

    case 'ai-visibility': {
      const counter = svg.querySelector<SVGTextElement>('[data-counter]')!;
      const dots = all<SVGCircleElement>('.dot').sort(
        (a, b) => Number(a.dataset.rank) - Number(b.dataset.rank),
      );
      const share = { v: 2 };
      const paint = () => {
        const lit = Math.round(share.v);
        counter.textContent = `${lit}%`;
        dots.forEach((dot, i) => dot.classList.toggle('on', i < lit));
      };
      reset = () => {
        share.v = 2;
        paint();
      };
      build.fromTo(share, { v: 2 }, { v: 20, duration: 1.5, ease: 'power2.inOut', onUpdate: paint }, 0.3);
      build.fromTo(svg.querySelector('.bar-after'), { scaleX: 1 / 3, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, 0.6);
      build.fromTo(svg.querySelector('.brand'), { x: -150 }, { x: 0, duration: 1.3, ease: 'power3.out' }, 0.7);
      loop = null;
      break;
    }

    case 'n8n':
      travel(loop, pkts[0], 0, 2.2, 'none');
      travel(loop, pkts[1], 0.7, 2.0, 'none');
      travel(loop, pkts[3], 1.4, 1.2, 'none');
      travel(loop, pkts[2], 2.1, 2.2, 'none');
      loop.repeatDelay(0.4);
      break;

    case 'lifecycle':
      pkts.forEach((p, i) => travel(loop!, p, i * 1.6, 4.8, 'none'));
      loop.repeatDelay(0);
      break;

    case 'consent': {
      const knob = svg.querySelector('.consent__knob');
      const on = svg.querySelector('.consent__on');
      const off = svg.querySelector('.consent__off');
      travel(loop, pkts[0], 0.2, 1.5, 'none');
      travel(loop, pkts[1], 0.7, 1.3, 'none');
      travel(loop, pkts[2], 1.2, 1.5, 'none');
      loop.to(knob, { x: -32, opacity: 0.45, duration: press.duration, ease: press.ease }, 3.0);
      loop.to(on, { opacity: 0, duration: 0.25 }, 3.0);
      loop.to(off, { opacity: 1, duration: 0.25 }, 3.1);
      travel(loop, pkts[3], 3.4, 0.7, 'power1.in');
      travel(loop, pkts[3], 4.3, 0.7, 'power1.in');
      loop.to(knob, { x: 0, opacity: 1, duration: press.duration, ease: press.ease }, 5.3);
      loop.to(off, { opacity: 0, duration: 0.25 }, 5.3);
      loop.to(on, { opacity: 1, duration: 0.25 }, 5.4);
      loop.repeatDelay(0.2);
      break;
    }
  }

  if (motion) reset();
  else build.progress(1);

  return {
    start() {
      if (!motion) return;
      loop?.pause(0);
      reset();
      build.restart();
      build.eventCallback('onComplete', () => loop?.play(0));
    },
    resume() {
      if (!motion) return;
      if (build.progress() < 1) build.play();
      else loop?.play();
    },
    pause() {
      build.pause();
      loop?.pause();
    },
    dispose() {
      build.kill();
      loop?.kill();
      [...wires, ...pkts].forEach((el) => (el.style.strokeDasharray = ''));
      nodes.forEach((n) => n.classList.remove('is-on'));
    },
  };
}
