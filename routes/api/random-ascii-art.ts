// API Route: Fetch random ASCII art from asciiart.eu
// Returns a random piece from a random category page

import { FreshContext } from "$fresh/server.ts";

// Curated list of good ASCII art categories
const ASCII_ART_PAGES = [
  "https://www.asciiart.eu/mythology/dragons",
  "https://www.asciiart.eu/art-and-design/escher",
  "https://www.asciiart.eu/cartoons/simpsons",
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

    // Fetch the page
    const response = await fetch(randomPage);
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
    console.error("Error fetching ASCII art:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch ASCII art",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
