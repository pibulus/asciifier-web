import { type PageProps } from "$fresh/server.ts";
import { KofiModal } from "../islands/KofiModal.tsx";
import { AboutModal } from "../islands/AboutModal.tsx";

export default function App({ Component }: PageProps) {
  // Pass env vars to client for analytics (only public keys)
  const analyticsEnv = {
    POSTHOG_KEY: Deno.env.get("POSTHOG_KEY"),
    POSTHOG_HOST: Deno.env.get("POSTHOG_HOST"),
  };

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ASCIIFIER • Text Art Machine</title>
        <meta
          name="description"
          content="Drop a pic. Get ASCII magic. 12 styles, live preview, $0 forever. No scale, no BS."
        />

        {/* Open Graph */}
        <meta property="og:title" content="ASCIIFIER • Pics to Text Art" />
        <meta
          property="og:description"
          content="The text art machine that actually slaps. Drop image, get ASCII."
        />
        <meta property="og:type" content="website" />

        {/* Favicon */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>"
        />

        {/* Styles */}
        <link rel="stylesheet" href="/styles.css" />

        {/* Analytics env vars */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(analyticsEnv)};`,
          }}
        />
      </head>
      <body>
        {/* Real grain texture using noise image */}
        <div
          id="grain-layer"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9999,
            opacity: 0.08,
            // Using a base64 noise pattern for true random grain
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='9' numOctaves='4' seed='5'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />

        {/* Optional: Subtle scanlines on top (much lighter) */}
        <div
          id="scan-layer"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10000,
            opacity: 0.03,
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.2),
              rgba(0, 0, 0, 0.2) 3px,
              transparent 3px,
              transparent 6px
            )`,
          }}
        />
        <Component />

        {/* Ko-fi donation modal */}
        <KofiModal
          kofiUsername="madebypablo"
          title="Support Free ASCII Magic ☕"
          description="Your support keeps this tool free, ad-free, and open for everyone!"
        />

        {/* About modal */}
        <AboutModal />
      </body>
    </html>
  );
}
