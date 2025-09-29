// Character sets for ASCII art generation
export const CHARACTER_SETS: Record<string, string> = {
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  dots: " ·•○●",
  minimal: " .-+#",
  retro: " .,;:clodxkO0KXNWM",
  shades: " ▁▂▃▄▅▆▇█",
  geometric: " ◦▫▪■",
  hearts: " ♡♥",
  gradient: " ░▒▓█",
};

export type CharacterStyle = keyof typeof CHARACTER_SETS;

export function getCharacters(style: CharacterStyle): string {
  return CHARACTER_SETS[style] || CHARACTER_SETS.classic;
}

// Style descriptions for UI
export const STYLE_DESCRIPTIONS: Record<CharacterStyle, string> = {
  classic: "Clean. Timeless. Works everywhere.",
  blocks: "Chunky blocks. Strong shadows.",
  dots: "Soft circles. Gentle progression.",
  minimal: "Less is more. Four chars only.",
  retro: "Old-school terminal vibes.",
  shades: "Smooth gradients. Subtle depth.",
  geometric: "Sharp shapes. Clean lines.",
  hearts: "Romance mode activated.",
  gradient: "Smooth transitions. Soft edges.",
};
