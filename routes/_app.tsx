import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
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
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
