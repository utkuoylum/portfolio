/* Session log: the page instruments itself, locally.
   Events live in memory for this tab only. Nothing is stored, nothing is sent.
   Public API: window.sessionLog.track(name, params) */
(function () {
  'use strict';

  var start = performance.now();
  var events = [];
  var listeners = [];

  function elapsed() {
    return (performance.now() - start) / 1000;
  }

  function track(name, params) {
    var event = { t: elapsed(), name: name, params: params || {} };
    events.push(event);
    for (var i = 0; i < listeners.length; i++) listeners[i](event);
    return event;
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  // Attribution: utm parameters first, then the referrer, otherwise direct.
  function source() {
    var query = new URLSearchParams(location.search);
    var utm = query.get('utm_source');
    if (utm) {
      var medium = query.get('utm_medium');
      return medium ? utm + ' / ' + medium : utm;
    }
    if (document.referrer) {
      try {
        var host = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (host && host !== location.hostname) return host;
      } catch (e) { /* malformed referrer: treat as direct */ }
    }
    return 'direct';
  }

  function clock(seconds) {
    var s = Math.floor(seconds);
    var m = Math.floor(s / 60);
    return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function formatParams(params) {
    return Object.keys(params).map(function (key) {
      return key + '=' + params[key];
    }).join('  ');
  }

  var api = {
    track: track,
    subscribe: subscribe,
    events: events,
    elapsed: elapsed,
    onRow: null // set by the motion layer to animate new rows
  };
  window.sessionLog = api;

  /* ---------- Renderer ---------- */

  function render() {
    var rows = document.querySelector('[data-log-rows]');
    var count = document.querySelector('[data-log-count]');
    var time = document.querySelector('[data-log-time]');
    var src = document.querySelector('[data-log-source]');
    if (!rows) return;

    var attributed = source();
    if (src) src.textContent = attributed === 'direct' ? 'Direct' : attributed;

    function add(event) {
      var row = document.createElement('li');
      row.className = 'log__row';
      var t = document.createElement('span');
      t.className = 't';
      t.textContent = clock(event.t);
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = event.name;
      var p = document.createElement('span');
      p.className = 'p';
      p.textContent = formatParams(event.params);
      row.appendChild(t);
      row.appendChild(n);
      row.appendChild(p);
      rows.insertBefore(row, rows.firstChild);
      while (rows.children.length > 120) rows.removeChild(rows.lastChild);
      if (count) count.textContent = String(events.length);
      if (typeof api.onRow === 'function') api.onRow(row);
    }

    events.forEach(add);
    subscribe(add);

    if (time) {
      setInterval(function () {
        time.textContent = clock(elapsed()).replace(/^0/, '');
      }, 1000);
    }
  }

  /* ---------- Automatic instrumentation ---------- */

  function instrument() {
    var params = { page: location.pathname, source: source() };
    var campaign = new URLSearchParams(location.search).get('utm_campaign');
    if (campaign) params.campaign = campaign;
    track('page_view', params);

    // Scroll depth, once per threshold.
    var marks = [25, 50, 75, 90];
    var ticking = false;
    function depth() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      while (marks.length && pct >= marks[0]) {
        track('scroll_depth', { percent: marks.shift() + '%' });
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(depth);
      }
    }, { passive: true });

    // Section and case impressions, once each.
    if ('IntersectionObserver' in window) {
      var seen = {};
      var sections = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('data-section');
          if (entry.isIntersecting && !seen[id]) {
            seen[id] = true;
            track('section_view', { section: id });
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      document.querySelectorAll('[data-section]').forEach(function (el) {
        if (el.getAttribute('data-section') !== 'hero') sections.observe(el);
      });

      var seenCase = {};
      var cases = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('data-case');
          if (entry.isIntersecting && !seenCase[id]) {
            seenCase[id] = true;
            track('case_view', { case: id });
          }
        });
      }, { rootMargin: '-40% 0px -40% 0px' });
      document.querySelectorAll('[data-case]').forEach(function (el) {
        cases.observe(el);
      });
    }

    // Declarative click tracking: data-track="event_name".
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;
      var name = el.getAttribute('data-track');
      var href = el.getAttribute('href') || '';
      if (name === 'outbound_click') {
        var host = '';
        try { host = new URL(href, location.href).hostname.replace(/^www\./, ''); } catch (err) {}
        track(name, { destination: host });
      } else if (name === 'nav_click') {
        track(name, { target: href.replace('#', '') || 'top' });
      } else if (name === 'email_click') {
        track(name, { method: 'mailto' });
      } else {
        track(name);
      }
    });

    // Copying text is a strong intent signal.
    document.addEventListener('copy', function (e) {
      // The copy button logs its own event; ignore its helper textarea.
      if (e.target && e.target.closest && e.target.closest('[data-log-ignore]')) return;
      var text = String(window.getSelection() || '');
      if (text) track('text_copy', { characters: text.length });
    });

    // Engaged time counts only while the tab is visible.
    var engaged = 0;
    var goals = [30, 60, 120, 300];
    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      engaged += 1;
      if (goals.length && engaged >= goals[0]) {
        track('engaged_time', { seconds: goals.shift() });
      }
    }, 1000);

    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        hiddenAt = performance.now();
      } else if (hiddenAt) {
        var away = Math.round((performance.now() - hiddenAt) / 1000);
        hiddenAt = 0;
        track('tab_return', { away: away + 's' });
      }
    });
  }

  function init() {
    render();
    instrument();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
