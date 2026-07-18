import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - ASCIIFIER couldn't find that</title>
      </Head>
      <div
        class="min-h-[100dvh] flex items-center justify-center px-4 py-8"
        style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))"
      >
        <div
          class="max-w-md w-full flex flex-col items-center text-center gap-4 p-8 border-4 rounded-3xl shadow-brutal"
          style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
        >
          <pre class="font-mono text-xs sm:text-sm leading-tight select-none opacity-80">
{`  ___  ___  _ _
 / _ \\/ _ \\| | |
| (_) | (_) |_|_|
 \\___/ \\___/(_|_)`}
          </pre>
          <h1 class="text-3xl font-black font-mono">404</h1>
          <p class="font-mono font-bold">
            That page turned to static. Nothing rendered here.
          </p>
          <a
            href="/"
            class="mt-2 px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
            style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
          >
            Back to ASCIIFIER
          </a>
        </div>
      </div>
    </>
  );
}
