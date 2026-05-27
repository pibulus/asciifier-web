import { FreshContext } from "$fresh/server.ts";
import { ASCII_MUSEUM_CATEGORIES } from "../../utils/constants.ts";
import {
  type AsciiArt,
  searchAsciiCollection,
} from "../../utils/ascii-collection.ts";

interface AsciiArtResponse {
  art: string;
  title: string;
  artist?: string;
  source: string;
  category: string;
  categoryName: string;
  sourceOnly?: boolean;
}

const DEFAULT_CATEGORY = ASCII_MUSEUM_CATEGORIES[0];

export const handler = (
  req: Request,
  _ctx: FreshContext,
): Response => {
  const url = new URL(req.url);
  const requestedCategory = url.searchParams.get("category") ||
    DEFAULT_CATEGORY.value;
  const query = (url.searchParams.get("q") || "").slice(0, 40);

  const category =
    ASCII_MUSEUM_CATEGORIES.find((item) => item.value === requestedCategory) ||
    DEFAULT_CATEGORY;

  const matches = searchAsciiCollection(category.value, query);

  if (matches.length === 0) {
    return jsonResponse(sourceOnlyResponse(category, query));
  }

  const art = pickRandom(matches);
  return jsonResponse(formatArtResponse(art, category));
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function formatArtResponse(
  item: AsciiArt,
  category: typeof ASCII_MUSEUM_CATEGORIES[number],
): AsciiArtResponse {
  return {
    art: cleanArt(item.art),
    title: item.title,
    artist: item.artist,
    source: category.sourceUrl,
    category: category.value,
    categoryName: category.name,
  };
}

function sourceOnlyResponse(
  category: typeof ASCII_MUSEUM_CATEGORIES[number],
  query: string,
): AsciiArtResponse {
  const searchUrl = query
    ? `https://www.asciiart.eu/search?q=${encodeURIComponent(query)}`
    : category.sourceUrl;

  return {
    title: `${category.name} source collection`,
    art: [
      `${category.name.toUpperCase()} SOURCE COLLECTION`,
      "",
      "This museum category links to ASCII Art Archive online.",
      "Open the source page to browse the full collection and keep artist credits intact.",
      "",
      searchUrl,
    ].join("\n"),
    source: searchUrl,
    category: category.value,
    categoryName: category.name,
    sourceOnly: true,
  };
}

function cleanArt(art: string): string {
  const lines = art.split("\n").map((line) => line.trimEnd());

  while (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  return lines.join("\n");
}

function jsonResponse(body: AsciiArtResponse): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
