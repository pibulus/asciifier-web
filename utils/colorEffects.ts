// ===================================================================
// COLOR EFFECTS - Shared color calculation utilities
// ===================================================================
// Used by both TextToAscii and AsciiGallery for consistent coloring

import { escapeHtml } from "./html.ts";

/**
 * Calculate HSL color for a specific position in ASCII art
 * based on the selected color effect
 */
export function getEffectColor(
  effect: string,
  x: number,
  y: number,
  lineWidth: number,
  totalLines: number,
): string {
  const safeLineWidth = Math.max(1, lineWidth);
  const safeTotalLines = Math.max(1, totalLines);

  switch (effect) {
    case "rainbow": {
      const hue = ((x * 18) + (y * 24)) % 360;
      return `hsl(${hue}, 90%, 60%)`;
    }
    case "matrix": {
      const bright = 45 + Math.sin((x + y) * 0.8) * 18;
      return `hsl(132, 100%, ${bright}%)`;
    }
    case "unicorn": {
      const hue = (x * 360 / safeLineWidth) % 360;
      return `hsl(${hue}, 95%, 65%)`;
    }
    case "fire": {
      const hue = 60 - (y * 60 / safeTotalLines);
      const sat = 100 - (y * 20 / safeTotalLines);
      return `hsl(${hue}, ${sat}%, 55%)`;
    }
    case "cyberpunk": {
      const progress = (x + y) / (safeLineWidth + safeTotalLines);
      const hue = 320 - (progress * 140);
      return `hsl(${hue}, 100%, 60%)`;
    }
    case "sunrise": {
      const progress = y / safeTotalLines;
      const hue = 330 + (progress * 60);
      const sat = 85 + (progress * 15);
      const bright = 60 + (progress * 20);
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "vaporwave": {
      const progress = y / safeTotalLines;
      const hue = 280 + (progress * 80);
      const sat = 80 + Math.sin((x + y) * 0.3) * 15;
      const bright = 65 + Math.sin(x * 0.4) * 10;
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "ocean": {
      const progress = y / safeTotalLines;
      const hue = 180 + (progress * 30); // Cyan (180) → Blue (210)
      const sat = 70 + (progress * 20);
      const bright = 50 + (progress * 20);
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "vampire": {
      const progress = (x + y) / (safeLineWidth + safeTotalLines);
      const hue = 0; // Deep red
      const sat = 90 + Math.sin(progress * 6) * 10;
      const bright = 20 + Math.sin(progress * 8) * 25; // Darker crimson to charcoal shimmer
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "ice": {
      const progress = (x + y) / (safeLineWidth + safeTotalLines);
      const hue = 190 + Math.sin(progress * 4) * 20; // 170 to 210 (cyan-blue)
      const sat = 80 - progress * 40; // Whitening effect
      const bright = 75 + progress * 20; // Soft bright ice
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "gold": {
      const progress = (x + y) / (safeLineWidth + safeTotalLines);
      const hue = 42 + Math.sin(progress * 5) * 5; // Gold hue
      const sat = 100;
      const bright = 45 + Math.sin(progress * 8) * 15; // Shimmering gold brightness
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "candy": {
      const progress = (x + y) / (safeLineWidth + safeTotalLines);
      const hue = 330 + Math.sin(progress * 6) * 15; // Hot pink range
      const sat = 100;
      const bright = 55 + progress * 25; // Bright bubblegum
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    default:
      return "#00FF41";
  }
}

/**
 * Apply a color effect to ASCII art text
 * Returns HTML with colored spans for each line
 */
export function applyColorToArt(art: string, effect: string): string {
  if (effect === "none" || !art) {
    return "";
  }

  const lines = art.split("\n");
  const colorizedLines: string[] = [];
  const widestLine = Math.max(1, ...lines.map((line) => line.length));

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];

    let colorizedLine = "";
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (char === " ") {
        colorizedLine += " ";
      } else {
        const color = getEffectColor(effect, x, y, widestLine, lines.length);
        colorizedLine += `<span style="color: ${color};">${
          escapeHtml(char)
        }</span>`;
      }
    }

    colorizedLines.push(colorizedLine);
  }

  return colorizedLines.join("\n");
}
