// Character sets for ASCII art generation
export const CHARACTER_SETS: Record<string, string> = {
  classic: " .:-=+*#%@",
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: " ░▒▓█",
  dots: " ·•○●",
  minimal: " .-+#",
  retro: " .,;:clodxkO0KXNWM",
  emoji: " .🟨🟧🟥",
  braille: " ⠁⠃⠇⠏⠟⠿⣿",
  shades: " ▁▂▃▄▅▆▇█",
  geometric: " ◦▫▪■",
  hearts: " ♡♥",
  gradient: " ░▒▓█"
};

export type CharacterStyle = keyof typeof CHARACTER_SETS;

export function getCharacters(style: CharacterStyle): string {
  return CHARACTER_SETS[style] || CHARACTER_SETS.classic;
}

// Style descriptions for UI
export const STYLE_DESCRIPTIONS: Record<CharacterStyle, string> = {
  classic: "The timeless ASCII choice",
  dense: "70+ characters for extreme detail",
  blocks: "Clean geometric blocks",
  dots: "Simple circular progression",
  minimal: "Minimalist approach",
  retro: "Classic computer aesthetic",
  emoji: "Colorful emoji squares",
  braille: "High-resolution braille patterns",
  shades: "Smooth gradients",
  geometric: "Clean geometric shapes",
  hearts: "For the romantics",
  gradient: "Smooth block gradients"
};