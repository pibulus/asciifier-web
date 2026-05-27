# ASCIIFIER Web

ASCIIFIER is a Deno/Fresh web app for turning images and text into ASCII art. It
has three main modes:

- Image to ASCII, processed in the browser with selectable character sets.
- Text to ASCII, generated server-side with Figlet fonts and custom HSL effects.
- ASCII Museum, a curated local starter collection with source links to
  asciiart.eu categories.

## Current Architecture

- `routes/index.tsx` renders the shell and tab container.
- `islands/Dropzone.tsx` converts uploaded, pasted, dragged, or camera images.
- `islands/TextToAscii.tsx` calls `POST /api/enhanced-figlet`.
- `islands/AsciiGallery.tsx` calls `GET /api/random-ascii-art`.
- `components/TerminalDisplay.tsx` owns copy, TXT export, and PNG export UI.
- `utils/image-processor.ts` handles client-side image conversion.
- `utils/ascii-collection.ts` holds the local museum samples.
- `utils/constants.ts` keeps shared dropdown options.
- `theme-system/` contains the reusable theme engine used by `utils/themes.ts`.

## Development

```bash
deno task start
```

The local server runs on `http://localhost:8001`. The dev watcher includes
`static/`, `routes/`, `islands/`, `components/`, `utils/`, and `theme-system/`.

## Verification

```bash
deno task check
deno task build
```

`deno task check` runs formatting checks, linting, and `deno check .`.

## Environment

Analytics are optional. Copy `.env.example` to `.env` and set public PostHog
values when needed:

```env
POSTHOG_KEY=phc_your_public_project_key
POSTHOG_HOST=https://us.i.posthog.com
```

If `POSTHOG_KEY` is missing, analytics are disabled.

## API

- `POST /api/enhanced-figlet` - text to Figlet ASCII with borders and HSL color
  effects.
- `GET /api/random-ascii-art` - random local museum art, or a source-only card
  linking to the matching asciiart.eu category/search.
- `GET /api/joke` - small legacy joke endpoint.

Image conversion is client-side; there is no current `/api/image-to-ascii`
route.

## Documentation Map

- `AGENTS.md` - short repo instructions for coding agents.
- `CLAUDE.md` - fuller project guide and architecture notes.
- `GLOSSARY.md` - current file and concept map.
- `TINKER.md` - quick-change reference for common edits.
- `STATS.md` - analytics CLI notes.
- `MEMORY_AUDIT.md` - historical memory/performance audit, kept as context.
- `theme-system/README.md` - reusable theme-system reference.
