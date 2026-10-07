// Background fields: barely visible, slowly moving patterns behind each section that respond to
// the pointer. One family (fine dots and hairlines, in the section's own ink at low alpha), one
// behaviour per section, drawn from what the section is about.
//
// Each field draws on a canvas that sticks to the viewport while its section scrolls past, so a
// canvas is never larger than the screen. One shared loop on the GSAP ticker draws only the
// fields in view; without the pointer, ambient motion runs at half rate.
import { gsap } from './gsap';
import { subscribe as onLogEvent } from './sessionLog';

export type FieldVariant = 'lens' | 'scan' | 'blueprint' | 'rings' | 'mesh' | 'quiet' | 'ripples';

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

type Frame = {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS pixels. */
  w: number;
  h: number;
  /** Seconds, and seconds since the last drawn frame. */
  t: number;
  dt: number;
  /** How far the canvas top sits below the section top, in CSS pixels. */
  anchor: number;
  /** 0 when the section enters the viewport, 1 when it has left. */
  progress: number;
  /** Smoothed pointer in canvas pixels and its presence, 0 to 1. */
  px: number;
  py: number;
  on: number;
  /** Raw pointer in canvas pixels. */
  rawX: number;
  rawY: number;
  click: boolean;
  /** "r, g, b" of the section's text color. */
  ink: string;
  section: HTMLElement;
  canvasLeft: number;
  canvasTop: number;
};

type Painter = {
  draw(frame: Frame): void;
  /** Something transient is moving, so draw every frame. */
  busy?(): boolean;
  dispose?(): void;
};

/** Groups dots and hairlines by alpha, so a frame needs a handful of fills and strokes. */
class Batch {
  private dots = new Map<number, number[]>();
  private lines = new Map<number, number[]>();

  dot(x: number, y: number, r: number, a: number) {
    if (a < 0.006 || r <= 0) return;
    const key = Math.min(60, Math.round(a * 100));
    let list = this.dots.get(key);
    if (!list) this.dots.set(key, (list = []));
    list.push(x, y, r);
  }

  line(x1: number, y1: number, x2: number, y2: number, a: number) {
    if (a < 0.006) return;
    const key = Math.min(60, Math.round(a * 100));
    let list = this.lines.get(key);
    if (!list) this.lines.set(key, (list = []));
    list.push(x1, y1, x2, y2);
  }

  flush(ctx: CanvasRenderingContext2D, ink: string) {
    ctx.lineWidth = 1;
    this.lines.forEach((list, key) => {
      ctx.strokeStyle = `rgba(${ink}, ${key / 100})`;
      ctx.beginPath();
      for (let i = 0; i < list.length; i += 4) {
        ctx.moveTo(list[i], list[i + 1]);
        ctx.lineTo(list[i + 2], list[i + 3]);
      }
      ctx.stroke();
    });
    this.dots.forEach((list, key) => {
      ctx.fillStyle = `rgba(${ink}, ${key / 100})`;
      ctx.beginPath();
      for (let i = 0; i < list.length; i += 3) {
        ctx.moveTo(list[i] + list[i + 2], list[i + 1]);
        ctx.arc(list[i], list[i + 1], list[i + 2], 0, TAU);
      }
      ctx.fill();
    });
    this.lines.clear();
    this.dots.clear();
  }
}

/** First grid column, so the grid sits centred in the section. */
const gridStart = (w: number, s: number) => (w - Math.floor(w / s) * s) / 2;

type GridOptions = {
  spacing: number;
  r: number;
  alpha: number;
  breathe: number;
  lensR: number;
  lensGrow: number;
  lensAlpha: number;
  push: number;
  /** A soft band that crosses the grid as the section is read. */
  scan?: boolean;
};

/** A dot grid that breathes slowly and swells under the pointer like a lens. */
function grid(o: GridOptions): Painter {
  const batch = new Batch();
  return {
    draw(f) {
      const s = o.spacing;
      const x0 = gridStart(f.w, s);
      const y0 = -(f.anchor % s);
      const band = o.scan ? f.progress * (f.w + 720) - 360 + Math.sin(f.t * 0.4) * 24 : 0;
      for (let y = y0; y < f.h + s; y += s) {
        const sy = y + f.anchor;
        for (let x = x0; x < f.w + s; x += s) {
          const n = Math.sin(x * 0.011 + f.t * 0.32) * Math.cos(sy * 0.013 - f.t * 0.26);
          let r = o.r + o.breathe * n;
          let a = o.alpha * (1 + 0.35 * n);
          let dx = x;
          let dy = y;
          if (o.scan) {
            const d = (x - band) / 180;
            const g = Math.exp(-d * d);
            a += 0.07 * g;
            r += 0.45 * g;
          }
          if (f.on > 0.001) {
            const ox = x - f.px;
            const oy = y - f.py;
            const d = Math.hypot(ox, oy);
            if (d < o.lensR) {
              const k = smooth(1 - d / o.lensR) * f.on;
              r += o.lensGrow * k;
              a += o.lensAlpha * k;
              if (d > 0.5) {
                dx += (ox / d) * o.push * k;
                dy += (oy / d) * o.push * k;
              }
            }
          }
          batch.dot(dx, dy, r, a);
        }
      }
      batch.flush(f.ctx, f.ink);
    },
  };
}

/** Things I build: a blueprint of crosses that turn under the pointer, with packets riding the rows. */
function blueprint(): Painter {
  const batch = new Batch();
  const s = 40;
  const packets: { sy: number; x: number; v: number }[] = [];
  let nextSpawn = 0;
  return {
    busy: () => packets.length > 0,
    draw(f) {
      const x0 = gridStart(f.w, s);
      const y0 = -(f.anchor % s);
      for (let y = y0; y < f.h + s; y += s) {
        for (let x = x0; x < f.w + s; x += s) {
          let a = 0.06;
          let arm = 3.5;
          let turn = 0;
          if (f.on > 0.001) {
            const d = Math.hypot(x - f.px, y - f.py);
            if (d < 260) {
              const k = smooth(1 - d / 260) * f.on;
              a += 0.22 * k;
              arm += 2.5 * k;
              turn = (Math.PI / 4) * k;
            }
          }
          const c = Math.cos(turn) * arm;
          const sn = Math.sin(turn) * arm;
          batch.line(x - c, y - sn, x + c, y + sn, a);
          batch.line(x + sn, y - c, x - sn, y + c, a);
        }
      }

      // Packets, like the ones in the case schematics, run along the grid rows.
      if (f.t > nextSpawn && packets.length < 4) {
        const rows = Math.max(1, Math.floor(f.h / s));
        const row = Math.floor(Math.random() * rows);
        packets.push({ sy: (Math.ceil(f.anchor / s) + row) * s, x: x0 - s, v: 70 + Math.random() * 50 });
        nextSpawn = f.t + 0.9 + Math.random() * 1.6;
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.x += p.v * f.dt;
        const y = p.sy - f.anchor;
        if (p.x > f.w + 60 || y < -s || y > f.h + s) {
          packets.splice(i, 1);
          continue;
        }
        batch.dot(p.x, y, 1.6, 0.28);
        for (let k = 1; k <= 5; k++) batch.dot(p.x - k * 7, y, 1.2, 0.24 * (1 - k / 6));
      }
      batch.flush(f.ctx, f.ink);
    },
  };
}

/** Experience: uneven rings, like a tree's, around the year odometer. The ring under the pointer lights up. */
function rings(): Painter {
  const batch = new Batch();
  const segments = 96;
  return {
    draw(f) {
      let cx = f.w * 0.2;
      let cy = f.h * 0.32;
      const odo = f.section.querySelector('.odo');
      if (odo) {
        const r = odo.getBoundingClientRect();
        if (r.width > 0) {
          cx = r.left + r.width / 2 - f.canvasLeft;
          cy = r.top + r.height / 2 - f.canvasTop;
        }
      }
      const reach = Math.hypot(Math.max(cx, f.w - cx), Math.max(cy, f.h - cy)) + 30;
      const pointerRadius = Math.hypot(f.px - cx, f.py - cy);
      for (let k = 0; ; k++) {
        const base = 74 + k * 26 + 8 * Math.sin(k * 12.9898);
        if (base > reach) break;
        // Rings fade with distance, so the area behind the role text stays calm.
        let a = 0.06 * (1 - 0.6 * clamp01(base / reach));
        if (f.on > 0.001) {
          const diff = Math.abs(base - pointerRadius);
          if (diff < 60) {
            const g = 1 - diff / 60;
            a += 0.16 * g * g * f.on;
          }
        }
        let px = 0;
        let py = 0;
        for (let i = 0; i <= segments; i++) {
          const th = (i / segments) * TAU;
          const rr = base + 1.8 * Math.sin(3 * th + k * 1.7 + f.t * 0.25) + 1.2 * Math.sin(7 * th - k + f.t * 0.18);
          const x = cx + Math.cos(th) * rr;
          const y = cy + Math.sin(th) * rr;
          if (i > 0) batch.line(px, py, x, y, a);
          px = x;
          py = y;
        }
      }
      batch.flush(f.ctx, f.ink);
    },
  };
}

/** Toolkit: a loose, drifting lattice whose points connect into a network near the pointer. */
function mesh(): Painter {
  const batch = new Batch();
  const s = 30;
  const reach = 240;
  let points = new Float32Array(0);
  return {
    draw(f) {
      const x0 = gridStart(f.w, s);
      const y0 = -(f.anchor % s);
      const cols = Math.ceil((f.w - x0) / s) + 2;
      const rows = Math.ceil((f.h - y0) / s) + 2;
      if (points.length < cols * rows * 3) points = new Float32Array(cols * rows * 3);
      const firstRow = Math.floor(f.anchor / s);
      for (let j = 0; j < rows; j++) {
        const gj = j + firstRow;
        for (let i = 0; i < cols; i++) {
          const x = x0 + i * s + 6 * Math.sin(i * 1.3 + gj * 0.7 + f.t * 0.15);
          const y = y0 + j * s + 6 * Math.cos(i * 0.9 - gj * 1.1 + f.t * 0.12);
          const d = f.on > 0.001 ? Math.hypot(x - f.px, y - f.py) : Infinity;
          const k = d < reach ? smooth(1 - d / reach) * f.on : 0;
          const at = (j * cols + i) * 3;
          points[at] = x;
          points[at + 1] = y;
          points[at + 2] = k;
        }
      }
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const at = (j * cols + i) * 3;
          const x = points[at];
          const y = points[at + 1];
          const k = points[at + 2];
          batch.dot(x, y, 0.9 + 1.1 * k, 0.09 + 0.16 * k);
          if (k < 0.01) continue;
          const link = (ni: number, nj: number) => {
            if (ni >= cols || nj >= rows) return;
            const nb = (nj * cols + ni) * 3;
            batch.line(x, y, points[nb], points[nb + 1], 0.13 * Math.min(k, points[nb + 2]));
          };
          link(i + 1, j);
          link(i, j + 1);
          link(i + 1, j + 1);
        }
      }
      batch.flush(f.ctx, f.ink);
    },
  };
}

/** Contact: the pointer, and every event the session log records, send a ripple through the dots. */
function ripples(section: HTMLElement): Painter {
  const batch = new Batch();
  const s = 26;
  const life = 2.8;
  const waves: { x: number; sy: number; t0: number; k: number }[] = [];
  let lastX = NaN;
  let lastY = NaN;
  let logged = false;
  const off = onLogEvent(() => {
    logged = true;
  });
  const emit = (x: number, sy: number, t0: number, k: number) => {
    waves.push({ x, sy, t0, k });
    if (waves.length > 7) waves.shift();
  };
  return {
    busy: () => waves.length > 0,
    dispose: off,
    draw(f) {
      if (f.on > 0.5) {
        if (Number.isNaN(lastX) || Math.hypot(f.rawX - lastX, f.rawY - lastY) > 170) {
          emit(f.rawX, f.rawY + f.anchor, f.t, 0.6);
          lastX = f.rawX;
          lastY = f.rawY;
        }
      } else {
        lastX = NaN;
      }
      if (f.click) emit(f.rawX, f.rawY + f.anchor, f.t, 1);
      if (logged) {
        logged = false;
        const rows = section.querySelector('.log__rows');
        if (rows) {
          const r = rows.getBoundingClientRect();
          emit(r.left + r.width * 0.5 - f.canvasLeft, r.top + 20 - f.canvasTop + f.anchor, f.t, 0.9);
        }
      }
      for (let i = waves.length - 1; i >= 0; i--) if (f.t - waves[i].t0 > life) waves.splice(i, 1);

      const x0 = gridStart(f.w, s);
      const y0 = -(f.anchor % s);
      for (let y = y0; y < f.h + s; y += s) {
        const sy = y + f.anchor;
        for (let x = x0; x < f.w + s; x += s) {
          let r = 0.8;
          let a = 0.075;
          let dx = x;
          let dy = y;
          for (const wave of waves) {
            const age = f.t - wave.t0;
            const ox = x - wave.x;
            const oy = sy - wave.sy;
            const d = Math.hypot(ox, oy);
            const w = (d - age * 150) / 30;
            const g = Math.exp(-w * w) * (1 - age / life) * wave.k;
            if (g < 0.01) continue;
            a += 0.2 * g;
            r += 1.1 * g;
            if (d > 0.5) {
              dx += (ox / d) * 4 * g;
              dy += (oy / d) * 4 * g;
            }
          }
          if (f.on > 0.001) {
            const d = Math.hypot(x - f.px, y - f.py);
            if (d < 150) {
              const k = smooth(1 - d / 150) * f.on;
              a += 0.12 * k;
              r += 0.6 * k;
            }
          }
          batch.dot(dx, dy, r, a);
        }
      }
      batch.flush(f.ctx, f.ink);
    },
  };
}

function painterFor(variant: FieldVariant, section: HTMLElement): Painter {
  switch (variant) {
    case 'lens':
      return grid({ spacing: 24, r: 0.85, alpha: 0.1, breathe: 0.22, lensR: 210, lensGrow: 1.5, lensAlpha: 0.2, push: 7 });
    case 'scan':
      return grid({ spacing: 24, r: 0.8, alpha: 0.08, breathe: 0.15, lensR: 170, lensGrow: 1.2, lensAlpha: 0.18, push: 5, scan: true });
    case 'quiet':
      return grid({ spacing: 24, r: 0.75, alpha: 0.07, breathe: 0.12, lensR: 150, lensGrow: 0.9, lensAlpha: 0.14, push: 3 });
    case 'blueprint':
      return blueprint();
    case 'rings':
      return rings();
    case 'mesh':
      return mesh();
    case 'ripples':
      return ripples(section);
  }
}

/* ---------- The shared loop ---------- */

type Field = {
  section: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  painter: Painter;
  visible: boolean;
  cssW: number;
  cssH: number;
  dpr: number;
  sx: number;
  sy: number;
  on: number;
  ink: string;
  frame: number;
  last: number;
  lastDraw: number;
};

const fields = new Set<Field>();
const pointer = { x: -1e5, y: -1e5, present: false, down: false };
let finePointer = false;
let running = false;

const onMove = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.present = true;
};
const onDown = (e: PointerEvent) => {
  onMove(e);
  if (e.pointerType !== 'touch') pointer.down = true;
};
const onLeave = () => {
  pointer.present = false;
};

function readInk(section: HTMLElement): string {
  const match = getComputedStyle(section).color.match(/\d+(\.\d+)?/g);
  return match ? match.slice(0, 3).join(', ') : '0, 0, 0';
}

function render(f: Field, now: number) {
  const vh = window.innerHeight;
  const sr = f.section.getBoundingClientRect();
  const cssW = Math.round(sr.width);
  const cssH = Math.round(Math.max(1, Math.min(vh, sr.height)));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cssW !== f.cssW || cssH !== f.cssH || dpr !== f.dpr) {
    f.cssW = cssW;
    f.cssH = cssH;
    f.dpr = dpr;
    f.canvas.style.height = `${cssH}px`;
    f.canvas.width = Math.round(cssW * dpr);
    f.canvas.height = Math.round(cssH * dpr);
  }
  const cr = f.canvas.getBoundingClientRect();
  const dt = Math.min(0.05, Math.max(0, now - f.last));
  f.last = now;

  const inside =
    finePointer &&
    pointer.present &&
    pointer.x >= sr.left &&
    pointer.x <= sr.right &&
    pointer.y >= Math.max(sr.top, 0) &&
    pointer.y <= Math.min(sr.bottom, vh);
  const rawX = pointer.x - cr.left;
  const rawY = pointer.y - cr.top;
  if (inside && f.on < 0.02) {
    f.sx = rawX;
    f.sy = rawY;
  } else {
    const follow = 1 - Math.exp(-dt * 10);
    f.sx += (rawX - f.sx) * follow;
    f.sy += (rawY - f.sy) * follow;
  }
  f.on += ((inside ? 1 : 0) - f.on) * (1 - Math.exp(-dt * 5));
  if (f.on < 0.002) f.on = 0;

  // Without the pointer or anything transient, ambient motion runs at half rate.
  f.frame += 1;
  const lively = f.on > 0 || pointer.down || (f.painter.busy?.() ?? false);
  if (!lively && f.frame % 2 === 1) return;
  if (f.frame % 90 === 0) f.ink = readInk(f.section);

  const sinceDraw = Math.min(0.1, Math.max(0, now - f.lastDraw));
  f.lastDraw = now;
  f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  f.ctx.clearRect(0, 0, cssW, cssH);
  f.painter.draw({
    ctx: f.ctx,
    w: cssW,
    h: cssH,
    t: now,
    dt: sinceDraw,
    anchor: cr.top - sr.top,
    progress: clamp01((vh - sr.top) / (vh + sr.height)),
    px: f.sx,
    py: f.sy,
    on: f.on,
    rawX,
    rawY,
    click: pointer.down && inside,
    ink: f.ink,
    section: f.section,
    canvasLeft: cr.left,
    canvasTop: cr.top,
  });
}

function tick() {
  const now = performance.now() / 1000;
  fields.forEach((f) => {
    if (f.visible) render(f, now);
  });
  pointer.down = false;
}

function start() {
  if (running) return;
  running = true;
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  gsap.ticker.add(tick);
}

function stop() {
  if (!running) return;
  running = false;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerdown', onDown);
  document.documentElement.removeEventListener('pointerleave', onLeave);
  window.removeEventListener('blur', onLeave);
  gsap.ticker.remove(tick);
}

/** Starts drawing `variant` behind `section`. Returns the cleanup. */
export function mountField(section: HTMLElement, canvas: HTMLCanvasElement, variant: FieldVariant): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const field: Field = {
    section,
    canvas,
    ctx,
    painter: painterFor(variant, section),
    visible: false,
    cssW: 0,
    cssH: 0,
    dpr: 0,
    sx: 0,
    sy: 0,
    on: 0,
    ink: readInk(section),
    frame: 0,
    last: performance.now() / 1000,
    lastDraw: performance.now() / 1000,
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      field.visible = entry.isIntersecting;
      if (field.visible) field.ink = readInk(section);
    },
    { rootMargin: '120px 0px' },
  );
  observer.observe(section);
  fields.add(field);
  start();

  return () => {
    observer.disconnect();
    field.painter.dispose?.();
    fields.delete(field);
    canvas.style.height = '';
    if (fields.size === 0) stop();
  };
}
