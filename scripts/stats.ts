#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * ASCIIFIER TERMINAL STATS
 * Query PostHog analytics and render beautiful ASCII charts
 *
 * Usage: deno run --allow-net --allow-env scripts/stats.ts [days]
 * Example: deno run --allow-net --allow-env scripts/stats.ts 7
 */

const POSTHOG_KEY = Deno.env.get("POSTHOG_KEY");
const POSTHOG_HOST = Deno.env.get("POSTHOG_HOST") || "https://us.i.posthog.com";

if (!POSTHOG_KEY) {
  console.error("❌ POSTHOG_KEY not set in environment");
  Deno.exit(1);
}

const DAYS = parseInt(Deno.args[0] || "7");

// ASCII bar chart generator
function renderBar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// Fetch events from PostHog
async function getEvents() {
  const url = `${POSTHOG_HOST}/api/projects/@current/events?limit=1000`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${POSTHOG_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`PostHog API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

// Analyze events
async function getStats() {
  console.log("📊 Fetching analytics from PostHog...\n");

  try {
    const events = await getEvents();

    // Filter to last N days
    const cutoff = Date.now() - (DAYS * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter((e: any) =>
      new Date(e.timestamp).getTime() > cutoff
    );

    // Count by event type
    const eventCounts: Record<string, number> = {};
    const exportFormats: Record<string, number> = {};
    const themes: Record<string, number> = {};
    const fonts: Record<string, number> = {};
    const effects: Record<string, number> = {};

    for (const event of recentEvents) {
      const eventName = event.event;
      eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;

      // Track specific properties
      if (eventName === "export_clicked" && event.properties?.format) {
        const format = event.properties.format;
        exportFormats[format] = (exportFormats[format] || 0) + 1;
      }

      if (eventName === "theme_changed" && event.properties?.to_theme) {
        const theme = event.properties.to_theme;
        themes[theme] = (themes[theme] || 0) + 1;
      }

      if (eventName === "ascii_generated" && event.properties?.font) {
        const font = event.properties.font;
        fonts[font] = (fonts[font] || 0) + 1;
      }

      if (eventName === "ascii_generated" && event.properties?.effect) {
        const effect = event.properties.effect;
        if (effect !== "none") {
          effects[effect] = (effects[effect] || 0) + 1;
        }
      }
    }

    return {
      totalEvents: recentEvents.length,
      eventCounts,
      exportFormats,
      themes,
      fonts,
      effects,
    };
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    Deno.exit(1);
  }
}

// Render the dashboard
async function renderDashboard() {
  const stats = await getStats();

  console.clear();

  // Header
  console.log(
    "\x1b[95m╔══════════════════════════════════════════════════════════╗\x1b[0m",
  );
  console.log(
    "\x1b[95m║\x1b[0m  \x1b[1m🎨 ASCIIFIER ANALYTICS\x1b[0m                                 \x1b[95m║\x1b[0m",
  );
  console.log(
    "\x1b[95m║\x1b[0m  \x1b[93mLast ${DAYS} days\x1b[0m                                             \x1b[95m║\x1b[0m",
  );
  console.log(
    "\x1b[95m╚══════════════════════════════════════════════════════════╝\x1b[0m",
  );
  console.log();

  // Total events
  console.log(
    `\x1b[96m📊 Total Events:\x1b[0m \x1b[1m${stats.totalEvents}\x1b[0m`,
  );
  console.log();

  // Event breakdown
  console.log("\x1b[96m🎯 Event Types:\x1b[0m");
  const maxEventCount = Math.max(...Object.values(stats.eventCounts));
  for (
    const [event, count] of Object.entries(stats.eventCounts).sort((a, b) =>
      b[1] - a[1]
    )
  ) {
    const bar = renderBar(count, maxEventCount, 30);
    console.log(`  ${bar} \x1b[93m${count}\x1b[0m ${event}`);
  }
  console.log();

  // Export formats
  if (Object.keys(stats.exportFormats).length > 0) {
    console.log("\x1b[96m💾 Export Formats:\x1b[0m");
    const maxExportCount = Math.max(...Object.values(stats.exportFormats));
    for (
      const [format, count] of Object.entries(stats.exportFormats).sort((
        a,
        b,
      ) => b[1] - a[1])
    ) {
      const bar = renderBar(count, maxExportCount, 20);
      console.log(`  ${bar} \x1b[92m${count}\x1b[0m ${format}`);
    }
    console.log();
  }

  // Popular themes
  if (Object.keys(stats.themes).length > 0) {
    console.log("\x1b[96m🎨 Popular Themes:\x1b[0m");
    const topThemes = Object.entries(stats.themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxThemeCount = Math.max(...topThemes.map((t) => t[1]));
    for (const [theme, count] of topThemes) {
      const bar = renderBar(count, maxThemeCount, 20);
      console.log(`  ${bar} \x1b[95m${count}\x1b[0m ${theme}`);
    }
    console.log();
  }

  // Popular fonts
  if (Object.keys(stats.fonts).length > 0) {
    console.log("\x1b[96m✍️  Popular Fonts:\x1b[0m");
    const topFonts = Object.entries(stats.fonts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxFontCount = Math.max(...topFonts.map((f) => f[1]));
    for (const [font, count] of topFonts) {
      const bar = renderBar(count, maxFontCount, 20);
      console.log(`  ${bar} \x1b[94m${count}\x1b[0m ${font}`);
    }
    console.log();
  }

  // Popular effects
  if (Object.keys(stats.effects).length > 0) {
    console.log("\x1b[96m🌈 Color Effects:\x1b[0m");
    const topEffects = Object.entries(stats.effects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxEffectCount = Math.max(...topEffects.map((e) => e[1]));
    for (const [effect, count] of topEffects) {
      const bar = renderBar(count, maxEffectCount, 20);
      console.log(`  ${bar} \x1b[91m${count}\x1b[0m ${effect}`);
    }
    console.log();
  }

  console.log(
    "\x1b[90m─────────────────────────────────────────────────────────\x1b[0m",
  );
  console.log(`\x1b[90mGenerated: ${new Date().toLocaleString()}\x1b[0m`);
}

// Run it
renderDashboard();
