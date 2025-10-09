// API Route: Fetch random ASCII art from asciiart.eu
// Returns a random piece from a random category page
// Falls back to hardcoded collection if external fetch fails

import { FreshContext } from "$fresh/server.ts";

// Curated list of good ASCII art categories
const ASCII_ART_PAGES = [
  "https://www.asciiart.eu/mythology/dragons",
  "https://www.asciiart.eu/art-and-design/escher",
  "https://www.asciiart.eu/cartoons/simpsons",
];

// Fallback ASCII art collection (used when external fetch fails)
const FALLBACK_ASCII_ART = [
  {
    art: `    /\\_/\\
   ( o.o )
    > ^ <`,
    category: "animals/cats",
  },
  {
    art: `       ,     ,
      (\\____/)
       (_oo_)
         (O)
       __||__    \\)
    []/______\\[] /
    / \\______/ \\/
   /    /__\\
  (\\   /____\\`,
    category: "animals/owls",
  },
  {
    art: `    .-.
   (o.o)
    |=|
   __|__
 //.=|=.\\\\
// .=|=. \\\\
\\\\ .=|=. //
 \\\\(_=_)//
  (:| |:)
   || ||
   () ()
   || ||
   || ||
  ==' '==`,
    category: "robots",
  },
  {
    art: `          __,__
 .--.  .-"     "-.  .--.
/ .. \\/  .-. .-.  \\/ .. \\
| |  '|  /   Y   \\  |'  | |
| \\   \\  \\ 0 | 0 /  /   / |
 \\ '- ,\\.-"'' ''"-./, -' /
  ''-' /_   ^ ^   _\\ '-''
      |  \\._   _./  |
      \\   \\ '~' /   /
       '._ '-=-' _.'
          '~---~'`,
    category: "animals/frogs",
  },
  {
    art: `        .     .
       |\\_/|  /|
      /@ @  \\/ |
     ( > º < ) |
      \`>>x<<´  |
      /  O  \\  |`,
    category: "animals/cats",
  },
  {
    art: `    ___
   /   \\
  | | | |
   \\___/
    | |
   _| |_
  |_____|`,
    category: "games/minecraft",
  },
  {
    art: `     ^~^  ,
    / o  o \\
   /   <>   \\
  /  ____    \\
 /     |      \\
/_____________\\`,
    category: "people/faces",
  },
  {
    art: `         *     ,MMM8&&&.            *
              MMMM88&&&&&    .
             MMMM88&&&&&&&
 *           MMM88&&&&&&&&
             MMM88&&&&&&&&
             'MMM88&&&&&&'
               'MMM8&&&'      *
      |\\___/|
      )     (             .              '
     =\\     /=
       )===(       *
      /     \\
      |     |
     /       \\
     \\       /
_/\\_/\\_/\\__  _/_/\\_/\\__/_____/_`,
    category: "animals/cats",
  },
];

interface AsciiArtResponse {
  art: string;
  source: string;
  category: string;
}

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  try {
    // Pick a random page
    const randomPage =
      ASCII_ART_PAGES[Math.floor(Math.random() * ASCII_ART_PAGES.length)];

    // Fetch the page with timeout (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(randomPage, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Extract category from URL
    const categoryMatch = randomPage.match(/\.eu\/([^/]+(?:\/[^/]+)?)/);
    const category = categoryMatch ? categoryMatch[1] : "unknown";

    // Parse ASCII art from <pre> tags
    // The site uses <pre> tags for ASCII art blocks
    const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    const matches = [...html.matchAll(preRegex)];

    if (matches.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No ASCII art found on page",
          source: randomPage,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Pick a random ASCII art piece
    const randomMatch = matches[Math.floor(Math.random() * matches.length)];
    const artContent = randomMatch[1];

    // Decode HTML entities and clean up
    let art = artContent
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");

    // Split into lines, trim each line's trailing whitespace, rejoin
    // This normalizes the whitespace while preserving leading spaces for alignment
    const lines = art.split("\n");
    const trimmedLines = lines.map((line) => line.trimEnd());

    // Remove leading/trailing empty lines
    while (trimmedLines.length > 0 && trimmedLines[0].trim() === "") {
      trimmedLines.shift();
    }
    while (
      trimmedLines.length > 0 &&
      trimmedLines[trimmedLines.length - 1].trim() === ""
    ) {
      trimmedLines.pop();
    }

    art = trimmedLines.join("\n");

    const result: AsciiArtResponse = {
      art,
      source: randomPage,
      category,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache", // Fresh art every time!
      },
    });
  } catch (error) {
    console.warn("External ASCII art fetch failed, using fallback:", error);

    // Fall back to hardcoded collection
    const randomFallback =
      FALLBACK_ASCII_ART[
        Math.floor(Math.random() * FALLBACK_ASCII_ART.length)
      ];

    const result: AsciiArtResponse = {
      art: randomFallback.art,
      source: "fallback-collection",
      category: randomFallback.category,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }
};
