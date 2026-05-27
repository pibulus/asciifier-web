# TINKER.md - ASCIIFIER Quick Reference

For fast repo changes after time away. The fuller map lives in `CLAUDE.md`; the
file glossary lives in `GLOSSARY.md`.

## Run It

```bash
deno task start
```

Local URL: `http://localhost:8001`

## Check It

```bash
deno task check
deno task build
```

Run `deno task manifest` after adding or deleting Fresh routes or islands.

## Files You Will Usually Touch

- Main shell/copy: `routes/index.tsx`
- Global metadata/env/service worker: `routes/_app.tsx`
- Image converter: `islands/Dropzone.tsx`
- Text converter: `islands/TextToAscii.tsx`
- Museum/gallery: `islands/AsciiGallery.tsx`
- Shared terminal/export UI: `components/TerminalDisplay.tsx`
- Shared dropdown UI: `components/MagicDropdown.tsx`
- Text ASCII API: `routes/api/enhanced-figlet.ts`
- Museum API: `routes/api/random-ascii-art.ts`
- Museum art: `utils/ascii-collection.ts`
- Dropdown options/categories: `utils/constants.ts`
- Image character styles: `utils/character-sets.ts`
- Color effect math: `utils/colorEffects.ts`
- Exports: `utils/exportUtils.ts`
- App themes: `utils/themes.ts`
- Global CSS: `static/styles.css`

## Current Feature Map

```text
Image tab
  Dropzone.tsx -> ImageProcessor -> TerminalDisplay

Text tab
  TextToAscii.tsx -> POST /api/enhanced-figlet -> TerminalDisplay

Gallery tab
  AsciiGallery.tsx -> GET /api/random-ascii-art -> TerminalDisplay
```

## Common Tweaks

### Add a Figlet Font

1. Add it to `FIGLET_FONTS` in `islands/TextToAscii.tsx`.
2. Make sure the value matches a font returned by `figlet.fontsSync()`.
3. Test with `POST /api/enhanced-figlet`.

### Add a Text Color Effect

1. Add the option to `COLOR_EFFECTS` in `utils/constants.ts`.
2. Add validation in `VALID_EFFECTS` in `routes/api/enhanced-figlet.ts`.
3. Add the effect math in `utils/colorEffects.ts`.
4. Mirror the effect in `applyColorEffect()` inside
   `routes/api/enhanced-figlet.ts` if generated text needs server-side HTML.

### Add a Visual Effect

1. Add the option to `VISUAL_EFFECTS` in `utils/constants.ts`.
2. Add the CSS/filter behavior in `getVisualEffectStyle()` in
   `components/TerminalDisplay.tsx`.

### Add Museum Art

1. Add an entry to `asciiCollection` in `utils/ascii-collection.ts`.
2. Set `sourceCategory` to one of the values in `ASCII_MUSEUM_CATEGORIES`.
3. Include `title`, optional `artist`, and useful `keywords`.
4. Keep source/artist attribution intact.

The museum should link to asciiart.eu categories/searches. Do not add a live
scraper.

### Add a Museum Category

1. Add the category to `ASCII_MUSEUM_CATEGORIES` in `utils/constants.ts`.
2. Add local samples in `utils/ascii-collection.ts` when downloadable/exportable
   art should be available.
3. If no local samples exist, the API returns a source-only card that links
   online.

### Add an Image Character Style

1. Add the character ramp in `utils/character-sets.ts`.
2. Add the dropdown option in `STYLE_OPTIONS` in `islands/Dropzone.tsx`.
3. Test with small and high-contrast images.

### Change Themes

1. Edit app themes in `utils/themes.ts`.
2. Keep reusable engine changes in `theme-system/mod.ts`.
3. Keep `theme-system/README.md` aligned if the public theme API changes.

### Change Exports

1. Start in `components/TerminalDisplay.tsx` for button/UI changes.
2. Use `utils/exportUtils.ts` for clipboard/TXT/PNG behavior.
3. Check mobile layout; export buttons live below the terminal content.

## API Smoke Tests

```bash
curl -X POST http://localhost:8001/api/enhanced-figlet \
  -H "Content-Type: application/json" \
  -d '{"text":"TEST","font":"Big","effect":"rainbow","borderStyle":"single"}'
```

```bash
curl "http://localhost:8001/api/random-ascii-art?category=animals/cats&q=cat"
```

```bash
curl http://localhost:8001/api/joke
```

## Troubleshooting

### Port 8001 Is Busy

```bash
lsof -i :8001
kill -9 PID_NUMBER
```

### Fresh Manifest Is Stale

```bash
deno task manifest
```

### Local UI Looks Stale

The app unregisters service workers on localhost. If the browser is still stale,
hard refresh and restart `deno task start`.

### Dependency Cache Is Weird

```bash
deno cache --reload dev.ts
```

Avoid deleting unrelated local changes when cleaning generated files.

## Deploy

GitHub Actions deploys `main` to Deno Deploy using
`.github/workflows/deploy.yml`.

Manual path:

```bash
deno task check
deno task build
deployctl deploy --prod
```

Deployment env vars:

- `POSTHOG_KEY` - optional public PostHog project key.
- `POSTHOG_HOST` - optional PostHog host, for example
  `https://us.i.posthog.com`.
