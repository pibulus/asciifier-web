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

      // Get all available fonts dynamically from figlet
      const availableFonts = figlet.fontsSync ? figlet.fontsSync() : [];

      // Validate and fallback font - check if requested font exists
      const safeFont = availableFonts.includes(font) ? font : "Standard";

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
    case "unicorn":
      // Pastel rainbow - soft, magical
      const unicornHue = (x * 360 / lineWidth) % 360;
      return `hsl(${unicornHue}, 85%, 75%)`;

    case "fire":
      // Fire gradient - red to yellow
      const fireHue = 60 - (y * 60 / totalLines);
      const fireSat = 100 - (y * 20 / totalLines);
      return `hsl(${fireHue}, ${fireSat}%, 50%)`;

    case "angel":
      // Angel - lush whites with soft gold/blue shimmer
      const angelProgress = (x + y) / (lineWidth + totalLines);
      const angelHue = 45 + Math.sin(angelProgress * 8) * 15; // Soft gold shimmer (30-60)
      const angelSat = 15 + Math.sin(angelProgress * 6) * 10; // Very subtle saturation
      const angelBright = 85 + Math.sin(angelProgress * 10) * 10; // Bright whites (75-95)
      return `hsl(${angelHue}, ${angelSat}%, ${angelBright}%)`;

    case "chrome":
      // Chrome reflection - cool blues/silvers
      const chromeHue = 200 + Math.sin(x * 0.2) * 60;
      const chromeBrightness = 70 + Math.sin(y * 0.3) * 20;
      return `hsl(${chromeHue}, 30%, ${chromeBrightness}%)`;

    case "sunrise":
      // Succulent sunrise - pink to orange to yellow gradient
      const sunriseProgress = y / totalLines;
      const sunriseHue = 330 + (sunriseProgress * 60); // Pink (330) → Orange (30) → Yellow (60)
      const sunriseSat = 85 + (sunriseProgress * 15);
      const sunriseBright = 60 + (sunriseProgress * 20);
      return `hsl(${sunriseHue}, ${sunriseSat}%, ${sunriseBright}%)`;

    case "cyberpunk":
      // Bangkok cyberpunk - hot pink to cyan gradient
      const cyberpunkProgress = (x + y) / (lineWidth + totalLines);
      const cyberpunkHue = 320 - (cyberpunkProgress * 140); // Pink (320) → Purple (280) → Cyan (180)
      return `hsl(${cyberpunkHue}, 100%, 65%)`;

    case "vaporwave":
      // Vaporwave - nostalgic 80s/90s aesthetic with pink, cyan, purple
      const vaporProgress = y / totalLines;
      const vaporHue = 280 + (vaporProgress * 80); // Purple (280) → Pink (320) → Hot Pink (340)
      const vaporSat = 80 + Math.sin((x + y) * 0.3) * 15;
      const vaporBright = 65 + Math.sin(x * 0.4) * 10;
      return `hsl(${vaporHue}, ${vaporSat}%, ${vaporBright}%)`;

    case "ocean":
      // Ocean - calming blue/cyan gradient
      const oceanProgress = y / totalLines;
      const oceanHue = 180 + (oceanProgress * 30); // Cyan (180) → Blue (210)
      const oceanSat = 70 + (oceanProgress * 20);
      const oceanBright = 50 + (oceanProgress * 20);
      return `hsl(${oceanHue}, ${oceanSat}%, ${oceanBright}%)`;

    case "neon":
      // Neon - bright electric oscillating colors
      const neonProgress = (x + y) / (lineWidth + totalLines);
      const neonHue = 60 + Math.sin(neonProgress * 10) * 120; // Yellow/Green/Pink oscillation
      const neonSat = 100;
      const neonBright = 60 + Math.sin(neonProgress * 8) * 15;
      return `hsl(${neonHue}, ${neonSat}%, ${neonBright}%)`;

    case "poison":
      // Poison - toxic radioactive green
      const poisonProgress = (x + y) / (lineWidth + totalLines);
      const poisonHue = 90 + (poisonProgress * 30); // Lime green (90) → Yellow-green (120)
      const poisonSat = 90 + Math.sin(x * 0.5) * 10;
      const poisonBright = 45 + (poisonProgress * 20);
      return `hsl(${poisonHue}, ${poisonSat}%, ${poisonBright}%)`;

    case "none":
    default:
      // Plain terminal green
      return "#00FF41";
  }
}
