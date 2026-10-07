/* Interface behaviour that does not depend on the motion layer:
   mobile menu, copy email, Berlin clock, toolkit cross-highlight. */
(function () {
  'use strict';

  var log = window.sessionLog || { track: function () {} };

  /* ---------- Mobile menu ---------- */

  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav__toggle-label').textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: { open: open } }));
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 700px)').addEventListener('change', function (mq) {
      if (mq.matches && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ---------- Copy email ---------- */

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(function () { return true; }, function () { return fallbackCopy(value); });
    }
    return Promise.resolve(fallbackCopy(value));
  }

  function fallbackCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.setAttribute('data-log-ignore', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    var label = button.querySelector('[data-copy-label]');
    var idle = label.textContent;
    var timer = 0;
    label.setAttribute('aria-live', 'polite');

    button.addEventListener('click', function () {
      copyText(button.getAttribute('data-copy')).then(function (ok) {
        label.textContent = ok ? 'Copied' : 'Copy failed, select the address instead';
        button.classList.toggle('is-done', ok);
        if (ok) log.track('email_copy', { method: 'button' });
        clearTimeout(timer);
        timer = setTimeout(function () {
          label.textContent = idle;
          button.classList.remove('is-done');
        }, 2400);
      });
    });
  });

  /* ---------- Berlin clock ---------- */

  var clockEl = document.querySelector('[data-clock]');
  if (clockEl && window.Intl) {
    var format = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    var tick = function () {
      var now = new Date();
      clockEl.textContent = format.format(now);
      clockEl.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- Toolkit: diagram and spec list highlight each other ---------- */

  var hovered = {};
  document.querySelectorAll('[data-flow] [data-layer], .specs [data-layer]').forEach(function (el) {
    var layer = el.getAttribute('data-layer');
    var group = document.querySelectorAll('[data-layer="' + layer + '"]');
    el.addEventListener('pointerenter', function () {
      group.forEach(function (node) { node.classList.add('is-hot'); });
      if (!hovered[layer]) {
        hovered[layer] = true;
        log.track('toolkit_hover', { layer: layer });
      }
    });
    el.addEventListener('pointerleave', function () {
      group.forEach(function (node) { node.classList.remove('is-hot'); });
    });
  });
})();
