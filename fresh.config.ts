import { defineConfig } from "$fresh/server.ts";

// NOTE: The Tailwind AOT plugin is deliberately NOT used here.
//
// With it enabled, the Deno Deploy builder had to resolve the entire
// tailwind/postcss npm graph at build time. That reliably killed the build:
// the builder died mid-resolution without emitting an error, and the
// build-log API truncates at ~1020 lines, so the failure never surfaced.
//
// Instead, static/styles.css is the PRECOMPILED stylesheet, committed to the
// repo, so deploys are pure asset serving with no npm work.
//
// To change styles: edit static/styles.src.css (the @tailwind source), run
// `deno task css` to regenerate static/styles.css, and commit both files.
export default defineConfig({
  server: {
    hostname: "0.0.0.0", // Allow local network access for phone testing
    port: 8001,
  },
});
