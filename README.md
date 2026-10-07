# utkuoylum.com

Single-page portfolio for Etem Utku Oylum. Next.js 16 static export, React 19, TypeScript, GSAP and
Lenis. No cookies, no storage, no third-party requests.

## Commands

```bash
npm install
npm run dev       # development server on http://localhost:8794
npm run build     # static export into out/
npm run preview   # build, then serve out/ on http://127.0.0.1:8793
npm run typecheck
```

`next start` does not serve static exports; `npm run preview` uses the small server in `serve.js`.

## Deploy

- Vercel: import the repository; it detects Next.js and serves the export. No settings needed.
- Netlify, Cloudflare Pages, any static host: build command `npm run build`, publish directory `out`.

The CV `.docx` sits next to this folder and is ignored by `.gitignore`. Keep it out of the repository:
it contains a phone number.

## Structure

| Path | What it holds |
| --- | --- |
| `app/layout.tsx` | Fonts (`next/font/local`), metadata, Open Graph, theme colors, the `no-js` boot script. |
| `app/page.tsx` | The page: header, sections, instrumentation, JSON-LD. |
| `app/globals.css` | Tokens (light and dark), type scale, layout, sections. |
| `app/robots.ts`, `app/sitemap.ts` | Generated as static files at build time. |
| `app/icon.svg`, `app/apple-icon.png`, `app/opengraph-image.png` | Icons and the share image. |
| `lib/content.ts` | All copy as typed data: cases, roles, toolkit, education, contact. |
| `lib/motion.ts`, `lib/gsap.ts` | Media queries, the baked spring ease, plugin registration. |
| `lib/schematic.ts` | Animates a case schematic: wires draw, nodes pop, packets ride the wires. |
| `lib/sessionLog.ts` | The session log store (`track`, `subscribe`). |
| `lib/field.ts`, `components/Field.tsx` | Background fields: one barely visible, pointer-aware pattern per section. |
| `components/` | One component per section; client components only where motion or state runs. |
| `components/schematics/` | The seven line drawings, pure SVG. |
| `public/llms.txt` | Summary for AI crawlers. |
| `tools/og.html`, `tools/icon.html` | Sources for the share image and the touch icon. |
| `docs/design.md` | Design notes: concept, tokens, motion language. |

## Editing content

- Copy lives in `lib/content.ts`. Keep facts aligned with the CV.
- A new case needs an entry in `work.cases` and a drawing in `components/schematics/` registered in
  `components/schematics/index.tsx`. Packet timing per drawing lives in `lib/schematic.ts`.
- The experience odometer reads `year` from each role.
- After changing the statement or title, regenerate the share image and copy it to
  `app/opengraph-image.png`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --allow-file-access-from-files --window-size=1200,630 --screenshot="$PWD/app/opengraph-image.png" "file://$PWD/tools/og.html"
```

## The session log

Every interaction fires a local event (`page_view`, `scroll_depth`, `section_view`, `case_view`,
`nav_click`, `outbound_click`, `email_click`, `email_copy`, `text_copy`, `toolkit_hover`,
`engaged_time`, `tab_return`) through `track()` in `lib/sessionLog.ts`, and the contact section lists
them. Attribution reads `utm_source` / `utm_medium` first, then the referrer, so a link shared as
`https://utkuoylum.com/?utm_source=linkedin&utm_medium=social` shows up as its source.

The copy on the page promises no cookies, no storage and nothing sent. If analytics are ever added,
update that copy and the footer line first, and add consent handling. Forwarding the existing events
to a data layer is a single `subscribe()` call.

## Motion and accessibility

- `prefers-reduced-motion: reduce` turns off smooth scrolling, scrubbing and loops; every element
  renders in its final state.
- Background fields draw on a canvas only on screens 700px and wider with motion allowed; phones,
  reduced motion and no-JS get the same dots as a static CSS pattern.
- The page is prerendered, so all content is in the HTML. If the motion layer does not start within
  2.5 seconds, a fallback reveals everything.
- One `h1`, semantic sections, visible keyboard focus, a skip link, and JSON-LD `Person` markup.
