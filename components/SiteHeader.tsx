'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { motionOK } from '@/lib/motion';
import { nav, person } from '@/lib/content';
import { useLenis } from './SmoothScroll';

// Which nav link a section belongs to (-1: none).
const SECTION_LINK: [string, number][] = [
  ['top', -1],
  ['profile', -1],
  ['work', 0],
  ['experience', 1],
  ['toolkit', 2],
  ['background', 2],
  ['contact', 3],
];

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const currentRef = useRef(-1);
  const lenis = useLenis();

  const [scrolled, setScrolled] = useState(false);
  const [showName, setShowName] = useState(false);
  const [overScene, setOverScene] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);

  // A hairline marks the section in view.
  const placeMarker = (instant: boolean) => {
    const marker = markerRef.current;
    const index = currentRef.current;
    if (!marker) return;
    const duration = instant || !motionOK() ? 0 : 0.6;
    if (index < 0) {
      gsap.to(marker, { opacity: 0, duration: duration && 0.3, overwrite: true });
      return;
    }
    const link = linkRefs.current[index];
    if (!link) return;
    gsap.to(marker, {
      x: link.offsetLeft,
      scaleX: link.offsetWidth / 100,
      opacity: 1,
      duration,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  useGSAP(
    () => {
      const header = headerRef.current!;
      const heroName = document.querySelector('.hero__name');
      const setBar = gsap.quickSetter(barRef.current, 'scaleX');
      const navH = () => header.offsetHeight;

      // Progress hairline, frosted bar once scrolled, and the name joins the bar
      // once the hero title has scrolled under it.
      const sync = (self: ScrollTrigger) => {
        setBar(self.progress);
        setScrolled(self.scroll() > 8);
        setShowName(!!heroName && heroName.getBoundingClientRect().bottom <= navH());
      };
      const page = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: sync });

      // Over a scene the bar takes the scene's tokens. (Query the document: the
      // context's scope is the header, and scoped selectors would find nothing.)
      document.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene) => {
        ScrollTrigger.create({
          trigger: scene,
          start: () => `top ${navH() / 2}`,
          end: () => `bottom ${navH() / 2}`,
          onToggle: (self) => setOverScene(self.isActive),
        });
      });

      SECTION_LINK.forEach(([id, index]) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setCurrent(index);
          },
        });
      });

      const onRefresh = () => {
        sync(page);
        placeMarker(true);
      };
      ScrollTrigger.addEventListener('refresh', onRefresh);
      return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    },
    { scope: headerRef },
  );

  useEffect(() => {
    currentRef.current = current;
    placeMarker(false);
  }, [current]);

  // Mobile menu: lock the page, stagger the links in, move focus.
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen);
    if (lenis.current) {
      if (menuOpen) lenis.current.stop();
      else lenis.current.start();
    }
    if (!menuOpen || !menuRef.current) return;
    menuRef.current.querySelector('a')?.focus({ preventScroll: true });
    if (motionOK()) {
      gsap.fromTo(
        menuRef.current.querySelectorAll('.menu__inner a, .menu__foot'),
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 },
      );
    }
  }, [menuOpen, lenis]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 700px)');
    const onChange = () => {
      if (wide.matches) setMenuOpen(false);
    };
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, []);

  // A link in the menu closes it first, so the page can scroll to the target.
  const onMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target as Element).closest('a')) return;
    document.documentElement.classList.remove('menu-open');
    lenis.current?.start();
    setMenuOpen(false);
  };

  const headerClass = ['nav', scrolled && 'is-scrolled', showName && 'show-name'].filter(Boolean).join(' ');

  return (
    <>
      <header ref={headerRef} className={headerClass} data-nav data-over={overScene ? 'scene' : undefined}>
        <div className="wrap nav__inner">
          <a className="nav__name" href="#top" data-track="nav_click">
            {person.name}
          </a>
          <nav className="nav__links" aria-label="Sections">
            {nav.map((item, i) => (
              <a
                key={item.href}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                href={item.href}
                data-track="nav_click"
                aria-current={current === i ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
            <span ref={markerRef} className="nav__marker" aria-hidden="true" />
          </nav>
          <button
            ref={toggleRef}
            className="nav__toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav__toggle-label">{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
        <div ref={barRef} className="nav__progress" aria-hidden="true" />
      </header>

      <div ref={menuRef} className="menu" id="menu" hidden={!menuOpen} onClick={onMenuClick}>
        <nav className="wrap menu__inner" aria-label="Sections">
          {nav.map((item) => (
            <a key={item.href} href={item.href} data-track="nav_click">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="wrap menu__foot">
          <a className="link" href={`mailto:${person.email}`} data-track="email_click">
            {person.email}
          </a>
          <a className="link" href={person.linkedin} target="_blank" rel="noopener" data-track="outbound_click">
            LinkedIn
          </a>
          <a className="link" href={person.github} target="_blank" rel="noopener" data-track="outbound_click">
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
