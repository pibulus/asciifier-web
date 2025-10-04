// ===================================================================
// COLOR EFFECTS - Shared color calculation utilities
// ===================================================================
// Used by both TextToAscii and AsciiGallery for consistent coloring

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
  switch (effect) {
    case "unicorn": {
      const hue = (x * 360 / lineWidth) % 360;
      return `hsl(${hue}, 95%, 65%)`;
    }
    case "fire": {
      const hue = 60 - (y * 60 / totalLines);
      const sat = 100 - (y * 20 / totalLines);
      return `hsl(${hue}, ${sat}%, 55%)`;
    }
    case "cyberpunk": {
      const progress = (x + y) / (lineWidth + totalLines);
      const hue = 320 - (progress * 140);
      return `hsl(${hue}, 100%, 60%)`;
    }
    case "sunrise": {
      const progress = y / totalLines;
      const hue = 330 + (progress * 60);
      const sat = 85 + (progress * 15);
      const bright = 60 + (progress * 20);
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "vaporwave": {
      const progress = y / totalLines;
      const hue = 280 + (progress * 80);
      const sat = 80 + Math.sin((x + y) * 0.3) * 15;
      const bright = 65 + Math.sin(x * 0.4) * 10;
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "chrome": {
      const hue = 200 + Math.sin(x * 0.2) * 60;
      const brightness = 70 + Math.sin(y * 0.3) * 20;
      return `hsl(${hue}, 30%, ${brightness}%)`;
    }
    case "ocean": {
      const progress = y / totalLines;
      const hue = 180 + (progress * 30); // Cyan (180) → Blue (210)
      const sat = 70 + (progress * 20);
      const bright = 50 + (progress * 20);
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "neon": {
      const progress = (x + y) / (lineWidth + totalLines);
      const hue = 60 + Math.sin(progress * 10) * 120; // Yellow/Green/Pink oscillation
      const sat = 100;
      const bright = 60 + Math.sin(progress * 8) * 15;
      return `hsl(${hue}, ${sat}%, ${bright}%)`;
    }
    case "poison": {
      const progress = (x + y) / (lineWidth + totalLines);
      const hue = 90 + (progress * 30); // Lime green (90) → Yellow-green (120)
      const sat = 90 + Math.sin(x * 0.5) * 10;
      const bright = 45 + (progress * 20);
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

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];

    // Calculate color for this line
    const color = getEffectColor(
      effect,
      Math.floor(line.length / 2),
      y,
      line.length,
      lines.length,
    );

    // Wrap entire line in colored span
    colorizedLines.push(`<span style="color: ${color};">${line}</span>`);
  }

  return colorizedLines.join("\n");
}
