import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ASCIIFIER - Turn Images into Beautiful ASCII Art</title>
        <meta name="description" content="The ultimate image to ASCII art tool. 12 character styles, color support, instant conversion. No complexity, just beautiful ASCII art." />

        {/* Open Graph */}
        <meta property="og:title" content="ASCIIFIER - Beautiful ASCII Art Generator" />
        <meta property="og:description" content="Turn any image into ASCII art with style, color, and soul!" />
        <meta property="og:type" content="website" />

        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>" />

        {/* Styles */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
