/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

// Only load .env in development (Deno Deploy injects env vars directly).
// Never fatal: the auto-loader throws if a key in .env.example is unset, which
// breaks builds and any run without a local .env.
if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  const { load } = await import("$std/dotenv/mod.ts");
  await load({ export: true, examplePath: null, allowEmptyValues: true });
}

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
