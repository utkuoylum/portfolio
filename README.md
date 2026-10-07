# utkuoylum.com

Single-page portfolio for Etem Utku Oylum. Static HTML, CSS and vanilla JavaScript with GSAP and
Lenis. No build step, no third-party requests, no cookies.

## Preview locally

```bash
node serve.js
```

Then open http://127.0.0.1:8793.

## Deploy

Publish the `site/` folder as the web root and point utkuoylum.com at it.

- Vercel: Root Directory `site`, no build command.
- Netlify: publish directory `site`, no build command.
- GitHub Pages: deploy `site/` with a Pages action.

The CV `.docx` sits next to this folder and is ignored by `.gitignore`. Keep it out of any public
repository: it contains a phone number.

## Structure

| Path | What it holds |
| --- | --- |
| `site/index.html` | All content and markup. Reads fine without JavaScript. |
| `site/assets/css/style.css` | Tokens (light and dark), type scale, layout, sections. |
| `site/assets/js/log.js` | The session log: local event tracking and its on-page view. |
| `site/assets/js/ui.js` | Mobile menu, copy email, Berlin clock, toolkit cross-highlight. |
| `site/assets/js/main.js` | Motion layer: GSAP ScrollTrigger and SplitText, Lenis. |
| `site/assets/vendor/` | GSAP 3.15.0 and Lenis 1.3.26, self-hosted. |
| `site/assets/fonts/` | Mona Sans and Fragment Mono woff2 (SIL Open Font License), self-hosted. |
| `site/llms.txt`, `robots.txt`, `sitemap.xml` | Search and AI crawler files. |
| `tools/og.html`, `tools/icon.html` | Sources for `og.png` and `apple-touch-icon.png`. |
| `docs/design.md` | Design notes: concept, tokens, motion language. |

## Editing content

- Copy lives in `site/index.html`. Keep facts aligned with the CV.
- Each case has an inline SVG schematic in `.case__figure`. On desktop the motion layer clones it
  into the sticky stage; on phones it stays inline.
- The AI visibility grid is 100 circles; `data-rank` sets the order in which they light up.
- The experience odometer reads `data-year` from each `.role`.
- After changing the statement or title, regenerate the share image:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --allow-file-access-from-files --window-size=1200,630 --screenshot="$PWD/site/assets/img/og.png" "file://$PWD/tools/og.html"
```

## The session log

Every interaction fires a local event (`page_view`, `scroll_depth`, `section_view`, `case_view`,
`nav_click`, `outbound_click`, `email_click`, `email_copy`, `text_copy`, `toolkit_hover`,
`engaged_time`, `tab_return`) through `window.sessionLog.track`, and the contact section lists them.
Attribution reads `utm_source` / `utm_medium` first, then the referrer, so a link shared as
`https://utkuoylum.com/?utm_source=linkedin&utm_medium=social` shows up as its source.

The copy on the page promises no cookies, no storage and nothing sent. If analytics are ever
added, update that copy and the footer line first, and add consent handling. Forwarding the
existing events to a data layer is a single `window.sessionLog.subscribe` call.

## Motion and accessibility

- `prefers-reduced-motion: reduce` turns off smooth scrolling, scrubbing and loops; every element
  renders in its final state.
- If the motion layer fails to load, a 2.5 second fallback reveals everything.
- One `h1`, semantic sections, visible keyboard focus, a skip link, and JSON-LD `Person` markup.
