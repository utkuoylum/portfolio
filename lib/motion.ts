// Motion language, from the hyperframes-animation skill:
// - expo.out for reveals, power3.out as the house settle, sine.inOut for ambient flow,
//   a baked damped spring for pops and presses;
// - group staggers stay under 0.5s so an arrival reads as one beat;
// - only transforms, opacity, clip-path and stroke offsets are animated;
// - prefers-reduced-motion gets the final state of everything, no scrubbing, no loops.

export const MOTION = '(prefers-reduced-motion: no-preference)';
export const DESKTOP = '(min-width: 960px)';
export const PHONE = '(max-width: 699px)';

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

export function motionOK(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOTION).matches;
}

export type Spring = { duration: number; ease: (progress: number) => number };

/**
 * A damped spring's closed-form position curve as a GSAP ease
 * (hyperframes-animation, adapters/gsap-easing-and-stagger.md).
 * damping 1 settles with no overshoot; 0.8 to 0.85 is the iOS register.
 * The settle time is part of the physics, so the duration comes with it.
 */
export function springEase(response: number, damping: number): Spring {
  const w = (2 * Math.PI) / response;
  const z = damping;
  let pos: (t: number) => number;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    pos = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  } else {
    pos = (t) => 1 - Math.exp(-w * t) * (1 + w * t);
  }
  const rate = z < 1 ? z * w : w;
  const scan = 12 / rate;
  const steps = 4800;
  let settle = scan;
  for (let i = steps; i >= 0; i--) {
    const t = (i / steps) * scan;
    if (Math.abs(1 - pos(t)) > 0.001) {
      settle = ((i + 1) / steps) * scan;
      break;
    }
  }
  const end = pos(settle);
  return { duration: settle, ease: (p) => pos(p * settle) + p * (1 - end) };
}

export const pop = springEase(0.42, 0.85);
export const press = springEase(0.3, 0.8);

/** Resolves when web fonts are ready, or after `timeout` ms, whichever comes first. */
export function fontsReady(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(finish);
    }
    setTimeout(finish, timeout);
  });
}
