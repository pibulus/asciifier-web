/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

// Only load .env in development (Deno Deploy injects env vars directly)
if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  await import("$std/dotenv/load.ts");
}

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
