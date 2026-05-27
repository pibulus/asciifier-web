# Glossary - ASCIIFIER Web

## App Entry Points

- `main.ts` - production server entrypoint.
- `dev.ts` - Fresh dev/build helper entrypoint.
- `fresh.config.ts` - Fresh plugin config.
- `fresh.gen.ts` - generated Fresh manifest; regenerate with
  `deno task manifest`.
- `deno.json` - tasks, imports, lint rules, and Deno settings.

## Routes

- `routes/index.tsx` - main app shell and tab host.
- `routes/_app.tsx` - document shell, metadata, analytics env bridge, service
  worker registration, global modals/toasts.
- `routes/_404.tsx` - not-found page.
- `routes/thanks.tsx` - support thank-you route that renders `ThanksPage`.

## API Routes

- `POST /api/enhanced-figlet` - `routes/api/enhanced-figlet.ts`; text to Figlet
  ASCII with optional border and color effect HTML.
- `GET /api/random-ascii-art` - `routes/api/random-ascii-art.ts`; random local
  museum sample or source-only archive link card.
- `GET /api/joke` - `routes/api/joke.ts`; small legacy text endpoint.

There is no current `/api/figlet`, `/api/colorize`, or `/api/image-to-ascii`
route.

## Islands

- `Dropzone` - image upload, drag/drop, paste, and camera capture UI.
- `TextToAscii` - text input, Figlet font selector, color selector, border
  selector, and API caller.
- `AsciiGallery` - museum category/search/color/effect controls.
- `TabsIsland` - renders the active app tab.
- `TabSwitcher` - tab button UI and active-tab signal updates.
- `ThemeIsland` - theme picker.
- `WelcomeChecker` - first-visit welcome state check.
- `WelcomeModal` - welcome modal and auto-type trigger.
- `AboutModal` / `AboutLink` - about dialog and footer opener.
- `KofiModal` / `KofiButton` - support modal and CTA.
- `ThanksPage` - support thank-you page UI.

## Components

- `TerminalDisplay` - shared terminal frame, ASCII display, shuffle button, copy
  button, TXT export, and PNG export.
- `MagicDropdown` - shared dropdown selector used by text/image/museum controls.
- `Toast` / `ToastContainer` / `showToast` - global toast system.
- `Button` - small shared styled button.

## Utilities

- `ascii-collection.ts` - curated local museum starter art with titles, artists,
  categories, and keywords.
- `constants.ts` - shared dropdown data for color effects, visual effects, and
  museum categories.
- `colorEffects.ts` - shared HSL color math and HTML span generation.
- `exportUtils.ts` - clipboard, TXT, and PNG export functions.
- `image-processor.ts` - client-side image-to-ASCII conversion engine.
- `character-sets.ts` - character ramps/styles for image conversion.
- `analytics.ts` - optional PostHog wrapper; no text/image contents tracked.
- `html.ts` - HTML escaping helper.
- `share.ts` - share helpers.
- `sounds.ts` - UI sound engine.
- `simple-typewriter.js` - typewriter sound helper.
- `easter-eggs.ts` - small hidden UI extras.
- `themes.ts` - app theme configuration.

## Theme System

- `theme-system/mod.ts` - reusable theme engine and random theme generator.
- `theme-system/asciifier-themes.ts` - app-specific theme exports.
- `theme-system/README.md` - standalone theme-system documentation.

## Static Assets

- `static/styles.css` - global CSS, animations, scrollbars, reduced-motion
  rules, and ASCII display defaults.
- `static/sw.js` - production service worker; navigation/API/Fresh assets are
  network-only.
- `static/manifest.json` - PWA metadata.
- `static/sitemap.xml` - public sitemap.
- `static/robots.txt` - crawler policy.
- `static/icons/` - PWA icons.
- `static/sounds/` - keyboard/audio assets.

## Core Concepts

- Figlet text generation - server-side text-to-ASCII generation through
  `figlet`.
- HSL effects - custom color spans generated from character positions.
- ASCII Museum - local curated samples with online source links, not live
  scraping.
- Source-only card - museum fallback that points to asciiart.eu when local art
  does not exist for a category/search.
- TerminalDisplay - the shared output surface for text, image, and museum art.
- Fresh islands - interactive Preact components hydrated selectively.
- Theme CSS variables - app colors are driven by `--color-*` values.
- Optional analytics - PostHog only loads when public env values are configured.

## Generated Or External Folders

- `_fresh/` - generated build output; not source.
- `node_modules/` - Deno npm compatibility directory; not source.
