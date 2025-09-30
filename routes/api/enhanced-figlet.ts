import { FreshContext } from "$fresh/server.ts";

interface AsciiArtRequest {
  text: string;
  font?: string;
  style?:
    | "bold"
    | "italic"
    | "underline"
    | "framed"
    | "encircled"
    | "overline"
    | "blink"
    | "inverse";
  color?: string; // Color name or hex
  borderStyle?: "single" | "double" | "block" | "angles" | "round";
  effect?:
    | "rainbow"
    | "fire"
    | "ocean"
    | "unicorn"
    | "matrix"
    | "metal"
    | "chrome";
  width?: number; // Control output width
}

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      text,
      font = "Doom",
      style,
      color = "#00FF41",
      borderStyle,
      effect = "none",
      width = 80,
    } = await req.json() as AsciiArtRequest;

    // Validate input
    if (!text || typeof text !== "string") {
      return new Response("Invalid text input", { status: 400 });
    }

    // Limit text length for performance
    const limitedText = text.slice(0, 30); // Increased limit for better art

    // Use figlet with enhancements (pure JS, no Canvas dependencies)
    let result: string;

    try {
      const figletModule = await import("figlet");
      const figlet = figletModule.default || figletModule;

      // List of valid fonts we know exist
      const validFonts = [
        "Standard",
        "Big",
        "Slant",
        "Small",
        "Banner",
        "Block",
        "Bubble",
        "Digital",
        "Ivrit",
        "Mini",
        "Script",
        "Shadow",
        "3-D",
        "3x5",
        "5 Line Oblique",
        "Alphabet",
        "Doom",
        "Epic",
        "Ghost",
        "Graffiti",
        "Isometric1",
        "Isometric2",
        "Isometric3",
        "Isometric4",
        "Poison",
        "Alligator",
        "Avatar",
        "Big Chief",
        "Broadway",
        "Crazy",
        "Gothic",
        "Sub-Zero",
        "Swamp Land",
        "Star Wars",
        "Sweet",
        "Weird",
        "Colossal",
        "Crawford",
        "Calgphy2",
        "Fire Font-s",
        "Fuzzy",
        "Bloody",
        "Speed",
        "Chunky",
        "Larry 3D",
      ];

      // Validate and fallback font
      const safeFont = validFonts.includes(font) ? font : "Standard";

      // Generate ASCII art with figlet
      result = figlet.textSync
        ? figlet.textSync(limitedText, {
          font: safeFont as any,
          horizontalLayout: "fitted",
          verticalLayout: "fitted",
        })
        : await new Promise((resolve, reject) => {
          figlet(limitedText, {
            font: safeFont as any,
            horizontalLayout: "fitted",
            verticalLayout: "fitted",
          }, (err: any, data: string) => {
            if (err) {
              console.error(`Font ${safeFont} failed, using fallback`);
              // Try with Standard font as ultimate fallback
              figlet(limitedText, {
                font: "Standard",
                horizontalLayout: "fitted",
                verticalLayout: "fitted",
              }, (err2: any, data2: string) => {
                if (err2) reject(err2);
                else resolve(data2);
              });
            } else {
              resolve(data);
            }
          });
        });
    } catch (figletError) {
      console.error("Figlet error:", figletError);
      // Fallback to plain text with basic ASCII border
      result = `
 ${limitedText}
${"─".repeat(limitedText.length + 2)}`;
    }

    // Apply border if requested - using manual implementation for reliability
    let borderedResult = result;
    if (borderStyle && borderStyle !== "none") {
      // Manual border implementation that always works
      const lines = result.split("\n");
      const maxLength = Math.max(...lines.map((l) => l.length));

      // Border characters based on style
      const borders: Record<string, any> = {
        "single": { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
        "double": { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
        "block": { tl: "█", tr: "█", bl: "█", br: "█", h: "█", v: "█" },
        "angles": { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
        "round": { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
      };

      const b = borders[borderStyle] || borders["single"];
      const horizontalBorder = b.h.repeat(maxLength + 2);

      borderedResult = [
        b.tl + horizontalBorder + b.tr,
        ...lines.map((line) => b.v + " " + line.padEnd(maxLength) + " " + b.v),
        b.bl + horizontalBorder + b.br,
      ].join("\n");
    }

    // Apply color effects
    let htmlResult = borderedResult;
    if (effect !== "none") {
      htmlResult = applyColorEffect(borderedResult, effect, color);
    } else if (color && color !== "#00FF41") {
      // Apply solid color
      htmlResult = `<span style="color: ${color};">${borderedResult}</span>`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        ascii: borderedResult,
        html: htmlResult,
        plain: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("ASCII Art API error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to generate ASCII art" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

// Apply color effects to ASCII art
function applyColorEffect(
  text: string,
  effect: string,
  baseColor: string,
): string {
  const lines = text.split("\n");
  const colorizedLines: string[] = [];

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    let colorizedLine = "";

    for (let x = 0; x < line.length; x++) {
      const char = line[x];

      if (char === " " || char === "") {
        colorizedLine += char;
      } else {
        const color = getEffectColor(effect, x, y, line.length, lines.length);
        colorizedLine += `<span style="color: ${color};">${char}</span>`;
      }
    }
    colorizedLines.push(colorizedLine);
  }

  return colorizedLines.join("\n");
}

// Enhanced color effects
function getEffectColor(
  effect: string,
  x: number,
  y: number,
  lineWidth: number,
  totalLines: number,
): string {
  switch (effect) {
    case "fire":
      // Enhanced fire gradient
      const fireHue = 60 - (y * 60 / totalLines);
      const fireSat = 100 - (y * 20 / totalLines);
      return `hsl(${fireHue}, ${fireSat}%, 50%)`;

    case "ocean":
      // Ocean waves
      const oceanHue = 180 + Math.sin((x + y) * 0.2) * 30;
      return `hsl(${oceanHue}, 70%, 50%)`;

    case "unicorn":
      // Pastel rainbow
      const unicornHue = (x * 360 / lineWidth) % 360;
      return `hsl(${unicornHue}, 85%, 75%)`;

    case "matrix":
      // Matrix green with depth
      const matrixBrightness = 30 + Math.random() * 40;
      return `hsl(120, 100%, ${matrixBrightness}%)`;

    case "metal":
      // Metallic silver/chrome effect
      const metalBrightness = 60 + Math.sin(x * 0.3) * 20;
      return `hsl(220, 10%, ${metalBrightness}%)`;

    case "chrome":
      // Chrome reflection effect
      const chromeHue = 200 + Math.sin(x * 0.2) * 60;
      const chromeBrightness = 70 + Math.sin(y * 0.3) * 20;
      return `hsl(${chromeHue}, 30%, ${chromeBrightness}%)`;

    case "rainbow":
    default:
      // Classic rainbow
      const hue = ((x + y * 2) * 360 / (lineWidth + totalLines * 2)) % 360;
      return `hsl(${hue}, 70%, 50%)`;
  }
}
