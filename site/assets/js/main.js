/* Motion layer for utkuoylum.com: GSAP 3 (ScrollTrigger, SplitText) and Lenis.

   Motion language, from the hyperframes-animation skill:
   - expo.out for the hero reveal, power3.out as the house settle,
     sine.inOut for ambient flow, a baked damped spring for pops and presses;
   - group staggers stay under 0.5s so an arrival reads as one beat;
   - only transforms, opacity, clip-path and stroke offsets are animated;
   - prefers-reduced-motion gets the final state of everything, no scrubbing, no loops. */
(function () {
  'use strict';

  var root = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  window.__motionReady = true;

  var log = window.sessionLog || { track: function () {} };
  var MOTION = '(prefers-reduced-motion: no-preference)';
  var DESKTOP = '(min-width: 960px)';
  var PHONE = '(max-width: 699px)';
  var mm = gsap.matchMedia();
  var lenis = null;

  function motionOK() {
    return window.matchMedia(MOTION).matches;
  }

  /* A damped spring's closed-form position curve as a GSAP ease
     (hyperframes-animation, adapters/gsap-easing-and-stagger.md).
     damping 1 settles with no overshoot; 0.8 to 0.85 is the iOS register.
     The settle time is part of the physics, so the duration comes with it. */
  function springEase(response, damping) {
    var w = (2 * Math.PI) / response;
    var z = damping;
    var pos;
    if (z < 1) {
      var wd = w * Math.sqrt(1 - z * z);
      pos = function (t) {
        return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
      };
    } else {
      pos = function (t) {
        return 1 - Math.exp(-w * t) * (1 + w * t);
      };
    }
    var rate = z < 1 ? z * w : w;
    var scan = 12 / rate;
    var steps = 4800;
    var settle = scan;
    for (var i = steps; i >= 0; i--) {
      var t = (i / steps) * scan;
      if (Math.abs(1 - pos(t)) > 0.001) {
        settle = ((i + 1) / steps) * scan;
        break;
      }
    }
    var end = pos(settle);
    return {
      duration: settle,
      ease: function (p) { return pos(p * settle) + p * (1 - end); }
    };
  }

  var pop = springEase(0.42, 0.85);
  var press = springEase(0.3, 0.8);

  function fontsReady(timeout) {
    return new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (!done) {
          done = true;
          resolve();
        }
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(finish);
      setTimeout(finish, timeout);
    });
  }

  /* ---------- Smooth scroll ---------- */

  mm.add(MOTION, function () {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    function raf(time) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return function () {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
    };
  });

  // In-page links go through Lenis when it runs, and always move focus.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented) return;
    var hash = link.getAttribute('href');
    var target = hash.length > 1 ? document.querySelector(hash) : null;
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(hash === '#top' ? 0 : target, { duration: 1.4 });
    } else {
      target.scrollIntoView();
    }
    if (history.replaceState) {
      history.replaceState(null, '', hash === '#top' ? location.pathname + location.search : hash);
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  document.addEventListener('menu:toggle', function (e) {
    var open = e.detail.open;
    if (lenis) {
      if (open) lenis.stop();
      else lenis.start();
    }
    if (open && motionOK()) {
      gsap.fromTo('.menu__inner a, .menu__foot',
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 });
    }
  });

  /* ---------- Navigation ---------- */

  (function navigation() {
    var nav = document.querySelector('[data-nav]');
    var bar = nav.querySelector('.nav__progress');
    var marker = nav.querySelector('.nav__marker');
    var links = gsap.utils.toArray('.nav__links a');
    var heroName = document.querySelector('.hero__name');
    var setBar = gsap.quickSetter(bar, 'scaleX');
    var navH = function () { return nav.offsetHeight; };

    // The name joins the bar once the hero title has scrolled under it.
    function sync(self) {
      setBar(self.progress);
      nav.classList.toggle('is-scrolled', self.scroll() > 8);
      nav.classList.toggle('show-name', heroName.getBoundingClientRect().bottom <= navH());
    }
    var page = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: sync });
    ScrollTrigger.addEventListener('refresh', function () { sync(page); });

    // Over a scene the bar takes the scene's tokens.
    gsap.utils.toArray('[data-scene]').forEach(function (scene) {
      ScrollTrigger.create({
        trigger: scene,
        start: function () { return 'top ' + navH() / 2; },
        end: function () { return 'bottom ' + navH() / 2; },
        onToggle: function (self) {
          if (self.isActive) nav.setAttribute('data-over', 'scene');
          else nav.removeAttribute('data-over');
        }
      });
    });

    // A hairline marks the section in view.
    var current = -1;
    function placeMarker(instant) {
      instant = instant || !motionOK();
      if (current < 0) {
        gsap.to(marker, { opacity: 0, duration: instant ? 0 : 0.3 });
        return;
      }
      var a = links[current];
      gsap.to(marker, {
        x: a.offsetLeft,
        scaleX: a.offsetWidth / 100,
        opacity: 1,
        duration: instant ? 0 : 0.6,
        ease: 'power3.out'
      });
    }
    function setCurrent(index) {
      if (index === current) return;
      current = index;
      links.forEach(function (a, i) {
        if (i === index) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      placeMarker(false);
    }
    var sections = [['top', -1], ['profile', -1], ['work', 0], ['experience', 1], ['toolkit', 2], ['background', 2], ['contact', 3]];
    sections.forEach(function (entry) {
      var el = document.getElementById(entry[0]);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: function (self) { if (self.isActive) setCurrent(entry[1]); }
      });
    });
    ScrollTrigger.addEventListener('refresh', function () { placeMarker(true); });
  })();

  /* ---------- Hero: one orchestrated entrance, then it recedes ---------- */

  mm.add(MOTION, function (context) {
    var hero = document.querySelector('[data-hero]');
    var statement = hero.querySelector('[data-hero-statement]');
    var name = hero.querySelector('.hero__name');
    var foot = hero.querySelector('.hero__foot');
    var footItems = gsap.utils.toArray(foot.querySelectorAll('[data-hero-item]'));
    var split = null;

    fontsReady(1200).then(function () {
      context.add(function () {
        split = SplitText.create(statement, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'hero-line',
          autoSplit: true,
          onSplit: function (self) {
            return gsap.fromTo(self.lines,
              { yPercent: 112 },
              { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.15 });
          }
        });
        gsap.set(statement, { visibility: 'visible' });

        var intro = gsap.timeline();
        intro
          .fromTo(name, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0)
          .fromTo(foot, { '--draw': 0 }, { '--draw': 1, duration: 1.4, ease: 'expo.out' }, 0.65)
          .fromTo(footItems, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.8)
          .add(function () { sweep(split.lines); }, 1.45);
      });
    });

    // Light passes once through the statement (gradient-text-sweep, form A).
    function sweep(lines) {
      if (!window.CSS || !CSS.supports('(-webkit-background-clip: text) or (background-clip: text)')) return;
      lines.forEach(function (line) { line.classList.add('sheen'); });
      gsap.fromTo(lines,
        { backgroundPosition: '100% 50%' },
        {
          backgroundPosition: '0% 50%',
          duration: 1.7,
          ease: 'none',
          stagger: 0.14,
          onComplete: function () {
            lines.forEach(function (line) {
              line.classList.remove('sheen');
              line.style.backgroundPosition = '';
            });
          }
        });
    }

    gsap.to(hero, {
      scale: 0.92,
      y: -40,
      autoAlpha: 0,
      transformOrigin: '0% 100%',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    return function () {
      if (split) split.revert();
    };
  });

  /* ---------- Profile: the paragraph fills as it is read ---------- */

  mm.add(MOTION, function () {
    var el = document.querySelector('[data-fill]');
    var split = SplitText.create(el, {
      type: 'words',
      wordsClass: 'fill-word',
      autoSplit: true,
      onSplit: function (self) {
        return gsap.fromTo(self.words, { opacity: 0.16 }, {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 }
        });
      }
    });
    return function () { split.revert(); };
  });

  /* ---------- Scenes open from an inset frame to full bleed ---------- */

  mm.add(MOTION, function () {
    gsap.utils.toArray('[data-scene]').forEach(function (scene) {
      gsap.fromTo(scene,
        { clipPath: 'inset(0% 3% 0% 3% round 48px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: scene, start: 'top bottom', end: 'top 20%', scrub: true }
        });
    });

    var title = document.querySelector('[data-contact-title]');
    var split = SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'contact-line',
      autoSplit: true,
      onSplit: function (self) {
        return gsap.fromTo(self.lines, { yPercent: 112 }, {
          yPercent: 0,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: title, start: 'top 85%', once: true }
        });
      }
    });
    return function () { split.revert(); };
  });

  /* ---------- Work: schematics ---------- */

  // A packet is a zero-length dash with round caps riding its path.
  function packetize(path) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = '0.001 ' + (len + 40);
    path.__len = len;
  }

  function travel(tl, path, at, duration, ease) {
    tl.fromTo(path, { strokeDashoffset: 0 }, { strokeDashoffset: -path.__len, duration: duration, ease: ease || 'power1.inOut' }, at);
    tl.fromTo(path, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, at);
    tl.to(path, { opacity: 0, duration: 0.2, ease: 'none' }, at + duration - 0.2);
  }

  function schematic(svg, motion) {
    var kind = svg.getAttribute('data-schem');
    var wires = gsap.utils.toArray(svg.querySelectorAll('.wires .ln:not(.ln--dash)'));
    var dashed = gsap.utils.toArray(svg.querySelectorAll('.wires .ln--dash'));
    var nodes = gsap.utils.toArray(svg.querySelectorAll('.nodes .node'));
    var labels = gsap.utils.toArray(svg.querySelectorAll(':scope > text'));
    var pkts = gsap.utils.toArray(svg.querySelectorAll('.pkt'));
    var reset = function () {};

    wires.forEach(function (wire) {
      var len = wire.getTotalLength();
      wire.style.strokeDasharray = len + ' ' + len;
      wire.__len = len;
    });
    pkts.forEach(packetize);

    var build = gsap.timeline({ paused: true });
    if (labels.length) build.fromTo(labels, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0);
    if (nodes.length) {
      build.fromTo(nodes,
        { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' },
        { autoAlpha: 1, scale: 1, duration: pop.duration, ease: pop.ease, stagger: 0.06 }, 0.05);
    }
    if (wires.length) {
      build.fromTo(wires,
        { strokeDashoffset: function (i, el) { return el.__len; } },
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.06 }, 0.15);
    }
    if (dashed.length) build.fromTo(dashed, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'none' }, 0.7);

    var loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });

    if (kind === 'website') {
      pkts.forEach(function (p, i) { travel(loop, p, i * 0.32, 1.1); });
    }

    if (kind === 'ai-visibility') {
      var counter = svg.querySelector('[data-counter]');
      var dots = gsap.utils.toArray(svg.querySelectorAll('.dot')).sort(function (a, b) {
        return a.getAttribute('data-rank') - b.getAttribute('data-rank');
      });
      var bar = svg.querySelector('.bar-after');
      var brand = svg.querySelector('.brand');
      var share = { v: 2 };
      var paint = function () {
        var lit = Math.round(share.v);
        counter.textContent = lit + '%';
        dots.forEach(function (dot, i) { dot.classList.toggle('on', i < lit); });
      };
      reset = function () { share.v = 2; paint(); };
      build.fromTo(share, { v: 2 }, { v: 20, duration: 1.5, ease: 'power2.inOut', onUpdate: paint }, 0.3);
      build.fromTo(bar, { scaleX: 1 / 3, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, 0.6);
      build.fromTo(brand, { x: -150 }, { x: 0, duration: 1.3, ease: 'power3.out' }, 0.7);
      loop = null;
    }

    if (kind === 'attribution') {
      // The classification fills in once the card is on screen.
      build.fromTo(svg.querySelectorAll('.attr-val'),
        { autoAlpha: 0, x: 8 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.18 }, 0.75);
      travel(loop, pkts[0], 0, 2.2, 'none');
      travel(loop, pkts[1], 0.6, 1.8, 'none');
      travel(loop, pkts[2], 1.2, 2.2, 'none');
      loop.repeatDelay(0.4);
    }

    if (kind === 'geo-roadmap') {
      // One signal circles the ring; each phase lights up as it arrives.
      var ring = pkts[0];
      var lap = 6;
      loop.set(ring, { opacity: 1 }, 0);
      loop.fromTo(ring, { strokeDashoffset: 0 }, { strokeDashoffset: -ring.__len, duration: lap, ease: 'none' }, 0);
      nodes.forEach(function (node, i) {
        loop.call(function () {
          nodes.forEach(function (n, k) { n.classList.toggle('is-on', k === i); });
        }, null, (i / nodes.length) * lap);
      });
      loop.repeatDelay(0);
    }

    if (kind === 'n8n') {
      travel(loop, pkts[0], 0, 2.2, 'none');
      travel(loop, pkts[1], 0.7, 2.0, 'none');
      travel(loop, pkts[3], 1.4, 1.2, 'none');
      travel(loop, pkts[2], 2.1, 2.2, 'none');
      loop.repeatDelay(0.4);
    }

    if (kind === 'lifecycle') {
      pkts.forEach(function (p, i) { travel(loop, p, i * 1.6, 4.8, 'none'); });
      loop.repeatDelay(0);
    }

    if (kind === 'consent') {
      var knob = svg.querySelector('.consent__knob');
      var on = svg.querySelector('.consent__on');
      var off = svg.querySelector('.consent__off');
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
    }

    if (motion) reset();
    else build.progress(1);

    return {
      start: function () {
        if (!motion) return;
        if (loop) loop.pause(0);
        reset();
        build.restart();
        build.eventCallback('onComplete', function () {
          if (loop) loop.play(0);
        });
      },
      resume: function () {
        if (!motion) return;
        if (build.progress() < 1) build.play();
        else if (loop) loop.play();
      },
      pause: function () {
        build.pause();
        if (loop) loop.pause();
      },
      dispose: function () {
        build.kill();
        if (loop) loop.kill();
        nodes.forEach(function (n) { n.classList.remove('is-on'); });
        wires.concat(pkts).forEach(function (el) { el.style.strokeDasharray = ''; });
      }
    };
  }

  mm.add({ desktop: DESKTOP, motion: MOTION }, function (context) {
    var desktop = context.conditions.desktop;
    var motion = context.conditions.motion;
    var cases = document.querySelector('[data-cases]');
    var articles = gsap.utils.toArray('[data-case]');
    var stage = document.querySelector('[data-stage]');
    var figures;

    if (desktop) {
      // Sticky media: one stage beside the scrolling text, one schematic per case.
      var panel = document.createElement('div');
      panel.className = 'stage__panel';
      stage.appendChild(panel);
      figures = articles.map(function (article) {
        var fig = document.createElement('div');
        var source = article.querySelector('.case__figure');
        // The n8n case keeps its dotted canvas on the stage too.
        fig.className = 'stage__fig' + (source.classList.contains('case__figure--grid') ? ' stage__fig--grid' : '');
        fig.appendChild(article.querySelector('.schem').cloneNode(true));
        stage.appendChild(fig);
        return fig;
      });
      cases.classList.add('has-stage');
    } else {
      figures = articles.map(function (article) { return article.querySelector('.case__figure'); });
    }

    var schems = figures.map(function (fig) { return schematic(fig.querySelector('.schem'), motion); });

    if (desktop) {
      var active = -1;
      gsap.set(figures, { autoAlpha: 0 });
      var activate = function (i) {
        if (i === active) return;
        var prev = active;
        active = i;
        articles.forEach(function (a, k) { a.classList.toggle('is-active', k === i); });
        if (prev >= 0) {
          schems[prev].pause();
          if (motion) gsap.to(figures[prev], { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.in', overwrite: true });
          else gsap.set(figures[prev], { autoAlpha: 0 });
        }
        if (motion) {
          gsap.fromTo(figures[i], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: prev >= 0 ? 0.2 : 0, overwrite: true });
        } else {
          gsap.set(figures[i], { autoAlpha: 1, y: 0 });
        }
        schems[i].start();
      };
      ScrollTrigger.create({
        trigger: cases,
        start: 'top 75%',
        onEnter: function () { if (active < 0) activate(0); }
      });
      articles.forEach(function (article, i) {
        ScrollTrigger.create({
          trigger: article,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: function (self) { if (self.isActive) activate(i); }
        });
      });
      // Loops rest while the section is off screen.
      ScrollTrigger.create({
        trigger: cases,
        start: 'top bottom',
        end: 'bottom top',
        onLeave: function () { if (active >= 0) schems[active].pause(); },
        onLeaveBack: function () { if (active >= 0) schems[active].pause(); },
        onEnter: function () { if (active >= 0) schems[active].resume(); },
        onEnterBack: function () { if (active >= 0) schems[active].resume(); }
      });
    } else {
      figures.forEach(function (fig, i) {
        var started = false;
        ScrollTrigger.create({
          trigger: fig,
          start: 'top 85%',
          end: 'bottom 10%',
          onToggle: function (self) {
            if (!self.isActive) schems[i].pause();
            else if (!started) {
              started = true;
              schems[i].start();
            } else schems[i].resume();
          }
        });
      });
    }

    return function () {
      schems.forEach(function (s) { s.dispose(); });
      if (desktop) {
        stage.innerHTML = '';
        cases.classList.remove('has-stage');
        articles.forEach(function (a) { a.classList.remove('is-active'); });
      }
    };
  });

  /* ---------- Experience: an odometer follows the role in view ---------- */

  mm.add(DESKTOP, function () {
    var exp = document.querySelector('.exp');
    var roles = gsap.utils.toArray('.role');
    var digits = gsap.utils.toArray('.odo__digit');

    function setYear(year) {
      String(year).split('').forEach(function (d, i) { digits[i].style.setProperty('--d', d); });
    }

    exp.classList.add('is-tracking');
    roles[0].classList.add('is-active');
    roles.forEach(function (role) {
      ScrollTrigger.create({
        trigger: role,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: function (self) {
          if (!self.isActive) return;
          roles.forEach(function (r) { r.classList.toggle('is-active', r === role); });
          setYear(role.getAttribute('data-year'));
        }
      });
    });

    return function () {
      exp.classList.remove('is-tracking');
      roles.forEach(function (r) { r.classList.remove('is-active'); });
      setYear(2026);
    };
  });

  /* ---------- Toolkit: the system assembles, then a signal runs through it ---------- */

  mm.add({ motion: MOTION, phone: PHONE }, function (context) {
    if (!context.conditions.motion) return;
    var vertical = context.conditions.phone;
    var flow = document.querySelector('[data-flow]');
    var nodes = gsap.utils.toArray(flow.querySelectorAll('.flow__node, .flow__bus'));
    var links = gsap.utils.toArray(flow.querySelectorAll('.flow__link'));
    var dots = links.map(function (link) { return link.querySelector('i'); });
    var axis = vertical ? 'scaleY' : 'scaleX';
    var shift = vertical ? 'yPercent' : 'xPercent';

    var from = { autoAlpha: 0, y: 14 };
    var build = gsap.timeline({ paused: true });
    build.fromTo(nodes, from, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0);
    var linkFrom = {};
    linkFrom[axis] = 0;
    var linkTo = { duration: 0.5, ease: 'power2.inOut', stagger: 0.1, transformOrigin: vertical ? '50% 0%' : '0% 50%' };
    linkTo[axis] = 1;
    build.fromTo(links, linkFrom, linkTo, 0.3);

    var signal = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8 });
    dots.forEach(function (dot, i) {
      var a = {};
      a[shift] = 0;
      var b = { duration: 0.6, ease: 'sine.inOut' };
      b[shift] = 100;
      signal.fromTo(dot, a, b, i * 0.55);
    });

    // Whichever way the visitor arrives (including a reload further down), the diagram ends up built.
    ScrollTrigger.create({
      trigger: flow,
      start: 'top 82%',
      end: 'bottom top',
      onEnter: function () {
        build.play();
        signal.play();
      },
      onEnterBack: function () {
        build.play();
        signal.play();
      },
      onLeave: function () {
        build.progress(1);
        signal.pause();
      },
      onLeaveBack: function () { signal.pause(); }
    });
  });

  /* ---------- Responses to the visitor ---------- */

  log.onRow = function (row) {
    if (!motionOK()) return;
    gsap.fromTo(row, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  };

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!motionOK()) return;
      gsap.fromTo(button, { scale: 0.94 }, { scale: 1, duration: press.duration, ease: press.ease });
    });
  });

  // Late font metrics change line breaks; measure again once they settle.
  fontsReady(2500).then(function () { ScrollTrigger.refresh(); });
})();
