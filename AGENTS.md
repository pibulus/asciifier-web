# AGENTS.md

Use this file as the quick entry point for coding agents working in this repo.
The fuller project guide is `CLAUDE.md`; the file map is `GLOSSARY.md`; quick
change recipes are in `TINKER.md`.

## Current App

ASCIIFIER Web is a Deno/Fresh app on local port `8001`.

- Image conversion is browser-side in `islands/Dropzone.tsx` and
  `utils/image-processor.ts`.
- Text conversion uses `POST /api/enhanced-figlet`.
- The ASCII Museum uses local art from `utils/ascii-collection.ts` and links to
  asciiart.eu for source browsing.
- Exports are centralized in `components/TerminalDisplay.tsx` and
  `utils/exportUtils.ts`.

## Working Rules

- Prefer existing Fresh island/component patterns.
- Do not scrape asciiart.eu; use local curated samples plus source links.
- Run `deno task check` before handing off substantial edits.
- Run `deno task manifest` after adding or deleting routes/islands.
- Treat `_fresh/` and `node_modules/` as generated/external output, not source.
- Keep `README.md`, `CLAUDE.md`, `GLOSSARY.md`, and `TINKER.md` in sync when
  architecture changes.
