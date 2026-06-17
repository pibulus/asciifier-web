/**
 * 🎨 Shared Constants
 *
 * Common constants used across components to avoid duplication.
 *
 * Built by Pablo for DRY goodness 🎸
 */

// Enhanced color effects - ordered neutral → warm → cool → special.
// These values are shared by text generation and museum/gallery colorization.
export const COLOR_EFFECTS = [
  { name: "Terminal", value: "none" },
  { name: "Matrix", value: "matrix" },
  { name: "Rainbow", value: "rainbow" },
  { name: "Fire", value: "fire" },
  { name: "Sunrise", value: "sunrise" },
  { name: "Unicorn", value: "unicorn" },
  { name: "Vaporwave", value: "vaporwave" },
  { name: "Cyberpunk", value: "cyberpunk" },
  { name: "Ocean", value: "ocean" },
  { name: "Vampire", value: "vampire" },
  { name: "Ice", value: "ice" },
  { name: "Gold", value: "gold" },
  { name: "Candy", value: "candy" },
];

// Visual effects for ASCII art display - CSS filter combinations
export const VISUAL_EFFECTS = [
  { name: "None", value: "none" },
  { name: "Neon", value: "neon" },
  { name: "Glitch", value: "glitch" },
  { name: "Thermal", value: "thermal" },
  { name: "Hologram", value: "hologram" },
  { name: "Retro", value: "retro" },
];

export const ASCII_MUSEUM_CATEGORIES = [
  {
    name: "Dragons",
    value: "mythology/dragons",
    sourceUrl: "https://www.asciiart.eu/mythology/dragons",
  },
  {
    name: "Cats",
    value: "animals/cats",
    sourceUrl: "https://www.asciiart.eu/animals/cats",
  },
  {
    name: "Geometry",
    value: "art-and-design",
    sourceUrl: "https://www.asciiart.eu/art-and-design",
  },
  {
    name: "Robots",
    value: "electronics/robots",
    sourceUrl: "https://www.asciiart.eu/electronics/robots",
  },
  {
    name: "Space",
    value: "space",
    sourceUrl: "https://www.asciiart.eu/space",
  },
  {
    name: "Computers",
    value: "computers",
    sourceUrl: "https://www.asciiart.eu/computers",
  },
  {
    name: "Music",
    value: "music",
    sourceUrl: "https://www.asciiart.eu/music",
  },
  {
    name: "Plants",
    value: "plants",
    sourceUrl: "https://www.asciiart.eu/plants",
  },
  {
    name: "Food",
    value: "food-and-drinks",
    sourceUrl: "https://www.asciiart.eu/food-and-drinks",
  },
  {
    name: "Games",
    value: "video-games",
    sourceUrl: "https://www.asciiart.eu/video-games",
  },
  {
    name: "Borders",
    value: "ascii-borders/gallery",
    sourceUrl: "https://www.asciiart.eu/ascii-borders/gallery",
  },
  {
    name: "Dividers",
    value: "ascii-dividers/gallery",
    sourceUrl: "https://www.asciiart.eu/ascii-dividers/gallery",
  },
  {
    name: "One-line",
    value: "one-line",
    sourceUrl: "https://www.asciiart.eu/one-line",
  },
  {
    name: "Simpsons",
    value: "cartoons/simpsons",
    sourceUrl: "https://www.asciiart.eu/cartoons/simpsons",
  },
];
