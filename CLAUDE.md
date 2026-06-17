# CLAUDE.md

This file gives Claude Code and other coding agents the working map for this
repository. Keep `README.md`, `GLOSSARY.md`, and `TINKER.md` in sync when the
architecture changes.

## Repository Overview

ASCIIFIER Web is a Deno/Fresh ASCII art app. It converts:

- images to ASCII in the browser,
- typed text to Figlet ASCII through a Fresh API route,
- curated museum samples to displayable, colorized, exportable terminal output.

The current architecture is:

`Fresh routes -> hydrated islands -> shared terminal/export components -> utils`

## Current Stack

- Framework: Deno/Fresh 1.7 with Preact islands.
- Styling: Tailwind plus CSS custom properties.
- Text ASCII: `figlet` in `routes/api/enhanced-figlet.ts`.
- Image ASCII: browser-side canvas/image processing in
  `utils/image-processor.ts`.
- Exports: clipboard, TXT, and PNG via `utils/exportUtils.ts`.
- Analytics: optional PostHog client loaded only when `POSTHOG_KEY` exists.
- Deployment: Deno Deploy through `.github/workflows/deploy.yml`.
- Local port: `8001`.

`lolcatjs` is still listed as a dependency, but the active browser color effects
are custom HSL span generation, not a `/api/colorize` route.

## Source Map

```text
asciifier-web/
├── routes/
│   ├── index.tsx                  # App shell and tab container
│   ├── _app.tsx                   # HTML head, env bridge, service worker setup
│   ├── thanks.tsx                 # Ko-fi/support thank-you route
│   └── api/
│       ├── enhanced-figlet.ts     # Text -> Figlet ASCII API
│       ├── random-ascii-art.ts    # Museum/local collection API
│       └── joke.ts                # Legacy joke endpoint
├── islands/
│   ├── Dropzone.tsx               # Image upload/paste/camera conversion
│   ├── TextToAscii.tsx            # Text controls and Figlet API caller
│   ├── AsciiGallery.tsx           # Museum/category/search UI
│   ├── ArciiArcade.tsx            # Retro ASCII Arcade games (Snake, Conway's Game of Life, Tetris)
│   ├── TabsIsland.tsx             # Active tab content
│   ├── TabSwitcher.tsx            # Tab buttons
│   ├── ThemeIsland.tsx            # Theme picker
│   ├── WelcomeChecker.tsx         # First-visit welcome trigger
│   ├── WelcomeModal.tsx           # Welcome modal
│   ├── AboutModal.tsx             # About modal and link
│   ├── KofiModal.tsx              # Support modal/button
│   └── ThanksPage.tsx             # Support thank-you page island
├── components/
│   ├── TerminalDisplay.tsx        # Shared terminal output and export controls
│   ├── MagicDropdown.tsx          # Shared dropdown control
│   ├── Toast.tsx                  # Toast store/container
│   └── Button.tsx                 # Small shared button
├── utils/
│   ├── ascii-collection.ts        # Local museum starter art
│   ├── constants.ts               # Shared dropdown options/categories
│   ├── colorEffects.ts            # HSL color span utilities
│   ├── exportUtils.ts             # Clipboard/TXT/PNG export helpers
│   ├── image-processor.ts         # Image -> ASCII conversion
│   ├── analytics.ts               # Optional PostHog wrapper
│   ├── html.ts                    # HTML escaping helpers
│   ├── themes.ts                  # App theme configuration
│   ├── sounds.ts                  # UI sound effects
│   ├── easter-eggs.ts             # Small interaction extras
│   └── simple-typewriter.js       # Typewriter audio helper
├── static/                        # CSS, PWA files, icons, sounds
├── theme-system/                  # Reusable theme engine
└── deno.json                      # Tasks, imports, lint settings
```

## Core Flows

### Image to ASCII

`Dropzone.tsx` accepts a file, pasted image, drag/drop image, or camera capture.
It calls `ImageProcessor` directly in the browser, then passes plain/HTML output
to `TerminalDisplay`.

### Text to ASCII

`TextToAscii.tsx` posts text, font, color effect, and border style to
`/api/enhanced-figlet`. The route validates the font/effect/border, runs Figlet,
applies optional border and HSL color spans, then returns plain ASCII and HTML.

### ASCII Museum

`AsciiGallery.tsx` uses categories from `utils/constants.ts` and local art from
`utils/ascii-collection.ts` through `/api/random-ascii-art`.

The museum intentionally does not scrape asciiart.eu. Categories link out to the
archive, and unmatched searches return a source-only card instead of pretending
to have downloadable art.

### Export

`TerminalDisplay` owns the shared copy/TXT/PNG buttons. `exportUtils.ts` strips
HTML/ANSI for TXT, writes rich HTML for clipboard where supported, and captures
PNG with `html-to-image`.

## Development Commands

```bash
deno task start
deno task check
deno task build
deno task preview
deno task manifest
```

`deno task start` and `deno task dev` both run on port `8001` and watch:
`static/`, `routes/`, `islands/`, `components/`, `utils/`, and `theme-system/`.

## Deployment

GitHub Actions builds and deploys with Deno Deploy:

```text
.github/workflows/deploy.yml
project: asciifier
entrypoint: main.ts
```

Set `POSTHOG_KEY` and `POSTHOG_HOST` in the deployment environment if analytics
should be active.

## Maintenance Notes

- Run `deno task check` before shipping.
- Run `deno task manifest` after adding or removing Fresh routes/islands.
- Keep `README.md`, `GLOSSARY.md`, and `TINKER.md` aligned with route/island
  changes.
- Do not treat `_fresh/` or `node_modules/` as source.
- On localhost, `_app.tsx` unregisters service workers so local UI changes do
  not get trapped behind stale caches.
