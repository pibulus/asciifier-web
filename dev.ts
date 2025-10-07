#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

// Load .env for local development
await import("$std/dotenv/load.ts");

await dev(import.meta.url, "./main.ts", config);
