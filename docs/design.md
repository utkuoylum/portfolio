# utkuoylum.com: design notes

Single-page portfolio for Etem Utku Oylum, Senior Marketing Technology & Automation Manager, Berlin.
Source of truth for content: `../Etem Utku Oylum _ Senior & Lead Martech Resume 2026 (1).docx`.
Only facts from the CV or confirmed by Etem appear on the page. The phone number and the .docx never ship.

## Brief

English. Black, white and grays only. Simple and clear at first glance; the quality shows in the
details. Apple-grade motion, built with GSAP. One page.

## Concept: the systems behind growth

Etem builds the machinery that captures, connects and acts on marketing signals. The page borrows
that vernacular (events, flows, nodes, signals) instead of decoration:

- Each case study gets a small schematic drawn in lines, not a stock illustration.
- The one bold idea: the page instruments itself. Every interaction fires a local event, and the
  contact section shows the visitor their own session log, the way Etem would see it in a debugger.
  Nothing is stored or sent; the log lives in the tab and is gone on close.

## Tokens

Color (pure neutrals, no tint):

| token | light | dark appearance |
| --- | --- | --- |
| `--bg` | `#ffffff` | `#000000` |
| `--fg` | `#000000` | `#ffffff` |
| `--mute` | `#6b6b6b` | `#8f8f8f` |
| `--rule` | `#e2e2e2` | `#262626` |
| `--surface` | `#f4f4f4` | `#121212` |
| `--s-bg` (scenes) | `#000000` | `#161616` |

Scenes (`.scene`) invert the base in light appearance (black). In dark appearance they lift to `#161616` so long sections stay comfortable on a dark screen.

Type: Mona Sans (variable wght 200-900, wdth 75-125) for everything; Fragment Mono only inside the
session log, because that content is code. Self-hosted, no third-party requests.

Scale: display `clamp(46px, 8.6vw, 140px)` / 600 / -0.045em; section titles
`clamp(44px, 6.2vw, 100px)` / 600 / -0.045em; statement `clamp(28px, 3.7vw, 58px)` / 600 / -0.032em;
body 18px / 1.55 (17px on phones); small 14px. Tabular numerals wherever numbers align.

Layout: 12-column grid, max 1440px, gutters `clamp(16px, 4vw, 56px)`. Left aligned throughout.
Line length under 70ch for body copy.

## Sections

1. Hero: name as the H1 (small), the statement "I build the systems behind growth." as the display line.
2. Profile: one paragraph that fills word by word as it is read (scroll-linked).
3. Things I build (scene): seven systems. Text scrolls, a sticky schematic changes per system: website
   events, GTM attribution, the AI visibility roadmap as a five-phase ring, the AI visibility result,
   an n8n workflow on a dotted canvas, the Retool to Braze lifecycle pipeline, consent-aware tracking.
4. Experience: roles from 2026 back to 2005; a sticky odometer year rolls to the active role.
5. Toolkit: the five stacks from the CV as a connected diagram plus a spec list; hover links both.
6. Education and languages: compact.
7. Contact (scene): email (copy on click), LinkedIn, GitHub, Berlin time, and the session log.

## Motion language (from the hyperframes-animation skill)

- Easing: `expo.out` for the hero reveal, `power3.out` as the house settle, `sine.inOut` for ambient
  flow, a baked critically damped spring (iOS register, damping 0.85) for nodes and presses.
- Group staggers stay under 0.5s total so an arrival reads as one beat.
- Only transforms, opacity, clip-path and stroke offsets are animated.
- No generic fade-up on every block. Motion lives in a few signature moments:
  hero line reveal + one silver sweep, scroll-linked profile fill, scene expansion from an inset
  rounded frame to full bleed, sticky schematics, year odometer, toolkit signal flow, live log rows.
- `prefers-reduced-motion`: no smooth scroll, no scrubbing, no loops; everything renders final.
- Content is readable without JavaScript.

## Tech

Next.js 16 (App Router) with `output: 'export'`, React 19 and TypeScript. Every section is prerendered
into `out/index.html`, so the content reads without JavaScript and crawlers that do not run scripts see
all of it. Motion runs in client components through `@gsap/react` (`useGSAP`), with GSAP 3.15
(ScrollTrigger, SplitText) and Lenis 1.3. Fonts are self-hosted through `next/font/local`.
Copy lives in `lib/content.ts`; the session log is a small store in `lib/sessionLog.ts`.
