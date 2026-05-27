# 📊 Analytics Dashboard

## View Stats in Terminal

```bash
# Last 7 days (default)
deno run --allow-net --allow-env scripts/stats.ts

# Last 30 days
deno run --allow-net --allow-env scripts/stats.ts 30
```

## What You'll See

```
╔══════════════════════════════════════════════════════════╗
║  🎨 ASCIIFIER ANALYTICS                                  ║
║  Last 7 days                                             ║
╚══════════════════════════════════════════════════════════╝

📊 Total Events: 1,234

🎯 Event Types:
  ████████████████████████████░░ 456 ascii_generated
  ██████████████░░░░░░░░░░░░░░░░ 234 export_clicked
  ██████████░░░░░░░░░░░░░░░░░░░░ 156 theme_changed

💾 Export Formats:
  ████████████████░░░░ 128 png
  ████████████░░░░░░░░ 78 html
  ██████░░░░░░░░░░░░░░ 28 text

🎨 Popular Themes:
  ████████████████░░░░ 89 Cyberpunk
  ██████████░░░░░░░░░░ 56 Unicorn Dreams
  ████░░░░░░░░░░░░░░░░ 23 Vintage Cream

✍️  Popular Fonts:
  ████████████████░░░░ 145 Big
  ██████████░░░░░░░░░░ 89 Doom
  ████░░░░░░░░░░░░░░░░ 34 Slant

🌈 Color Effects:
  ████████████████░░░░ 167 unicorn
  ██████████░░░░░░░░░░ 98 cyberpunk
  ████░░░░░░░░░░░░░░░░ 45 fire

─────────────────────────────────────────────────────────
Generated: 2025-10-01 19:54:23
```

## Setup

Make sure your `.env` file has PostHog credentials. Analytics are optional; if
`POSTHOG_KEY` is missing, the app skips PostHog initialization.

```env
POSTHOG_KEY=phc_your_public_project_key
POSTHOG_HOST=https://us.i.posthog.com
```

## What Gets Tracked

- ASCII generation (font, effect, success)
- Image conversion (file size, success)
- Export actions (format: png, html, text)
- Theme changes
- Random ASCII art views

**Privacy**: No personal data, no text content, just aggregate metrics.
