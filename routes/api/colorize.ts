import { FreshContext } from "$fresh/server.ts";

interface ColorizeRequest {
  text: string;
  effect?: 'rainbow' | 'fire' | 'ocean' | 'unicorn' | 'matrix';
  speed?: number;
}

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { text, effect = "rainbow", speed = 1 } = await req.json() as ColorizeRequest;

    if (!text || typeof text !== "string") {
      return new Response("Invalid text input", { status: 400 });
    }

    // Import lolcatjs for rainbow effects
    const lolcat = await import("lolcatjs");

    // Apply colorization based on effect
    let colorizedText = "";

    switch (effect) {
      case 'rainbow':
        colorizedText = lolcat.default.fromString(text);
        break;
      case 'fire':
        colorizedText = lolcat.default.fromString(text, { seed: 40, spread: 3.0 });
        break;
      case 'ocean':
        colorizedText = lolcat.default.fromString(text, { seed: 120, spread: 8.0 });
        break;
      case 'unicorn':
        colorizedText = lolcat.default.fromString(text, { seed: 280, spread: 2.0 });
        break;
      case 'matrix':
        colorizedText = lolcat.default.fromString(text, { seed: 80, spread: 1.0 });
        break;
      default:
        colorizedText = lolcat.default.fromString(text);
    }

    // Convert ANSI colors to HTML for rich paste
    const htmlColorized = ansiToHtml(colorizedText);

    return new Response(JSON.stringify({
      success: true,
      ansi: colorizedText,
      html: htmlColorized,
      plainText: text
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Colorize API error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to colorize text" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

// Convert ANSI escape sequences to HTML with colors
function ansiToHtml(text: string): string {
  return text
    .replace(/\u001b\[38;5;(\d+)m/g, (match, colorCode) => {
      const color = ansiColorToHex(parseInt(colorCode));
      return `<span style="color: ${color};">`;
    })
    .replace(/\u001b\[(\d+)m/g, (match, code) => {
      switch (code) {
        case '0': return '</span>'; // Reset
        case '1': return '<strong>'; // Bold
        case '22': return '</strong>'; // Bold off
        default: return '';
      }
    })
    .replace(/\u001b\[[0-9;]*m/g, ''); // Clean up any remaining codes
}

// Convert ANSI 256-color codes to hex
function ansiColorToHex(colorCode: number): string {
  // Basic colors (0-15)
  if (colorCode < 16) {
    const basicColors = [
      '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    return basicColors[colorCode] || '#ffffff';
  }

  // 216-color cube (16-231)
  if (colorCode < 232) {
    const index = colorCode - 16;
    const r = Math.floor(index / 36) * 51;
    const g = Math.floor((index % 36) / 6) * 51;
    const b = (index % 6) * 51;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Grayscale (232-255)
  const gray = 8 + (colorCode - 232) * 10;
  const hex = gray.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}