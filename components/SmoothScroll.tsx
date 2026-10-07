'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MOTION, fontsReady } from '@/lib/motion';

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/** The running Lenis instance, if any. Smooth scrolling is off under reduced motion. */
export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const query = window.matchMedia(MOTION);
    const raf = (time: number) => lenisRef.current?.raf(time * 1000);
    const start = () => {
      if (lenisRef.current) return;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRef.current = lenis;
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (!lenisRef.current) return;
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenisRef.current.destroy();
      lenisRef.current = null;
    };
    const sync = () => (query.matches ? start() : stop());
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      stop();
    };
  }, []);

  // In-page links go through Lenis when it runs, and always move focus.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link || event.defaultPrevented) return;
      const hash = link.getAttribute('href') ?? '';
      const target = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
      if (!target) return;
      event.preventDefault();
      if (lenisRef.current) lenisRef.current.scrollTo(hash === '#top' ? 0 : target, { duration: 1.4 });
      else target.scrollIntoView();
      history.replaceState(history.state, '', hash === '#top' ? location.pathname + location.search : hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Late font metrics change line breaks; measure again once they settle.
  useEffect(() => {
    let alive = true;
    fontsReady(2500).then(() => {
      if (alive) ScrollTrigger.refresh();
    });
    return () => {
      alive = false;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
