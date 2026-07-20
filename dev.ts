#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

// Load .env for local development only. This must never be fatal: the Deno
// Deploy builder runs `deno task build` with no .env and no DENO_DEPLOYMENT_ID,
// and the auto-loader throws MissingEnvVarsError on any key listed in
// .env.example but absent from the environment. Load explicitly with
// example-checking disabled, and treat a missing file as a no-op.
const isCI = Deno.env.get("CI") !== undefined;
const isProduction = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
if (!isCI && !isProduction) {
  const { load } = await import("$std/dotenv/mod.ts");
  await load({ export: true, examplePath: null, allowEmptyValues: true });
}

await dev(import.meta.url, "./main.ts", config);
