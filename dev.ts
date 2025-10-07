#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

// Only load .env in local development (skip in CI/production builds)
const isCI = Deno.env.get("CI") !== undefined;
const isProduction = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
if (!isCI && !isProduction) {
  await import("$std/dotenv/load.ts");
}

await dev(import.meta.url, "./main.ts", config);
