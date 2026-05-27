// Curated local ASCII Art Collection
// Purpose: downloadable museum samples and welcome examples.
// Online archive links point to asciiart.eu without scraping their gallery pages.

export interface AsciiArt {
  title: string;
  category: string;
  sourceCategory?: string;
  art: string;
  artist?: string;
  keywords?: string[];
}

export const asciiCollection: AsciiArt[] = [
  // Dragons
  {
    title: "Dragon Text",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "mythology", "banner"],
    art: `      \_
   \_\_| |\_ \_\_ \_\_ \_  \_\_ \_  \_\_\_  \_ \_\_  \_\_\_
  / \_\` | '\_\_/ \_\` |/ \_\` |/ \_ \\| '\_ \\/ \_\_|
 | (\_| | | | (\_| | (\_| | (\_) | | | \\\_\_ \\
  \\\_\_,\_|\_|  \\\_\_,\_|\\\_\_, |\\\_\_\_/|\_| |\_|\_\_\_/
                  |\_\_\_/                 `,
  },
  {
    title: "Small Dragon",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "mythology"],
    art: `       .
 .>   )\\;\`a\_\_
(  \_ \_)/ /-." ~~
 \`( )\_ )/
  <\_  <\_`,
    artist: "sb/dwb",
  },
  {
    title: "Cute Dragon",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "mythology"],
    art: `                    /     \\
                   ((     ))
               ===  \\\\\_v\_//  ===
                ====)\_^\_(====
                ===/ O O \\===
                = | /\_ \_\\ | =
               =   \\/\_ \_\\/   =
                    \\\_ \_/
                    (o\_o)
                     VwV`,
    artist: "Roland Waylor",
  },

  // Cats
  {
    title: "Simple Cat",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["cat", "animal"],
    art: ` /\\_/\\
( o o )
==_Y_==
  \`-'`,
  },
  {
    title: "Detailed Cat",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["cat", "animal"],
    art: `   |\\---/|
   | ,_, |
    \\_\`_/-..----.
 ___/ \`   ' ,""+ \\
(___...'   __\\    |\`.___.';
  (___,'(___,\`___()/'.....+`,
    artist: "sk",
  },

  // Geometric Art
  {
    title: "Tetrahedron",
    category: "geometry",
    sourceCategory: "art-and-design",
    keywords: ["geometry", "shape", "art"],
    art: `       ^
      /|\\
     / | \\
    /  |  \\
    '-.|.-'`,
    artist: "KCK",
  },
  {
    title: "Dodecahedron",
    category: "geometry",
    sourceCategory: "art-and-design",
    keywords: ["geometry", "shape", "art"],
    art: `      _----------_,
    ,"__         _-:,
   /    ""--_--""...:\\
  /         |.........\\
 /          |..........\\
/,         _'_........./
! -,    _-"   "-_... ,;;:
\\   -_-"         "-_/;;;;
 \\   \\             /;;;;'
  \\   \\           /;;;;
   '.  \\         /;;;'
     "-_\_____/;;'`,
    artist: "Michael Naylor",
  },

  // Robots
  {
    title: "Pocket Robot",
    category: "electronics",
    sourceCategory: "electronics/robots",
    keywords: ["robot", "electronics", "android", "bot"],
    art: `    .------.
   /  .--.  \\
  |  | [] |  |
  |  |____|  |
  |   ____   |
  |  | __ |  |
  |__|/__\\|__|
    /_/  \\_\\`,
    artist: "Asciifier",
  },
  {
    title: "Signal Bot",
    category: "electronics",
    sourceCategory: "electronics/robots",
    keywords: ["robot", "signal", "antenna", "bot"],
    art: `      \\ | /
       .-.
  .---(o o)---.
 /  .-' ^ '-.  \\
 |  |  [_]  |  |
  \\  '-.__.-'  /
   '--.____.--'
      /|  |\\
     _/    \\_`,
    artist: "Asciifier",
  },

  // Space
  {
    title: "Tiny Rocket",
    category: "space",
    sourceCategory: "space",
    keywords: ["space", "rocket", "launch"],
    art: `        /\\
       /  \\
      /++++\\
     /  ()  \\
     |      |
     |  /\\  |
    /| |  | |\\
   /_|_|__|_|_\\
      /_/\\_\\
       ****`,
    artist: "Asciifier",
  },
  {
    title: "Orbit",
    category: "space",
    sourceCategory: "space",
    keywords: ["space", "planet", "orbit", "stars"],
    art: `        .       *
    *        .-.
         --- (   ) ---
      .       '-'
           *       .
       .      ___
            .'   '.
     *     /  o    \\
           \\     o /
            '.___.'`,
    artist: "Asciifier",
  },

  // Computers
  {
    title: "Old Terminal",
    category: "computers",
    sourceCategory: "computers",
    keywords: ["computer", "terminal", "screen"],
    art: ` .----------------.
 | ASCIIFIER> _   |
 |                |
 |  []  []  []    |
 '----------------'
      |      |
   .--'------'--.
   |____________|`,
    artist: "Asciifier",
  },
  {
    title: "Floppy Disk",
    category: "computers",
    sourceCategory: "computers",
    keywords: ["computer", "floppy", "disk", "save"],
    art: ` .------------.
 |  __    __  |
 | |  |  |  | |
 | |__|  |__| |
 |            |
 |  .------.  |
 |  |______|  |
 '------------'`,
    artist: "Asciifier",
  },

  // Music
  {
    title: "Cassette",
    category: "music",
    sourceCategory: "music",
    keywords: ["music", "cassette", "tape", "retro"],
    art: ` .----------------.
 |  .--.    .--.  |
 | ( () )--( () ) |
 |  '--'    '--'  |
 |   MIX TAPE     |
 | .------------. |
 | '------------' |
 '----------------'`,
    artist: "Asciifier",
  },
  {
    title: "Guitar Amp",
    category: "music",
    sourceCategory: "music",
    keywords: ["music", "guitar", "amp", "speaker"],
    art: ` .------------.
 |  VOLUME  7 |
 |  o o o o   |
 | .--------. |
 | | ////// | |
 | | ////// | |
 | '--------' |
 '------------'`,
    artist: "Asciifier",
  },

  // Plants
  {
    title: "Window Plant",
    category: "plants",
    sourceCategory: "plants",
    keywords: ["plant", "leaf", "pot"],
    art: `      \\  |  /
       \\ | /
    .---\\|/---.
   /   _/|\\_   \\
   \\__/  |  \\__/
        \\|/
       .---.
      /_____\\
        | |`,
    artist: "Asciifier",
  },
  {
    title: "Cactus Friend",
    category: "plants",
    sourceCategory: "plants",
    keywords: ["plant", "cactus", "desert"],
    art: `       _
    _ | | _
   | || || |
   | || || |
   | || || |
    \\     /
     |   |
   __|___|__
  /_________\\`,
    artist: "Asciifier",
  },

  // Food and drinks
  {
    title: "Coffee Cup",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["coffee", "drink", "cup", "cafe"],
    art: `      )  )  )
     (  (  (
   .----------.
   |          |]
   |  COFFEE  |
   |          |
   '----------'
    \\________/`,
    artist: "Asciifier",
  },
  {
    title: "Pizza Slice",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["pizza", "food", "slice"],
    art: `        /\\
       /  \\
      / oo \\
     /  o   \\
    / o   o  \\
   /___o______\\
       \\  /
        \\/`,
    artist: "Asciifier",
  },

  // Video games
  {
    title: "Arcade Cabinet",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["game", "arcade", "joystick", "video"],
    art: ` .------------.
 |  INSERT 25 |
 | .--------. |
 | |  >__   | |
 | | /|  \\  | |
 | '--------' |
 |   o  +++   |
 |  /|\\       |
 '------------'`,
    artist: "Asciifier",
  },
  {
    title: "Gamepad",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["game", "controller", "gamepad", "video"],
    art: `    ______________
  .'  _      _   '.
 /   (_)    (_)    \\
 |  _   ____   _   |
 | (_) |____| (_)  |
 \\                /
  '.___      ___.'
      '------'`,
    artist: "Asciifier",
  },

  // Welcome Messages
  {
    title: "Welcome Banner",
    category: "text",
    sourceCategory: "one-line",
    keywords: ["welcome", "banner", "text"],
    art: `
 ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀  ▀▀▀▀█░█▀▀▀▀  ▀▀▀▀█░█▀▀▀▀
▐░▌       ▐░▌▐░▌          ▐░▌               ▐░▌          ▐░▌
▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░▌               ▐░▌          ▐░▌
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌               ▐░▌          ▐░▌
▐░█▀▀▀▀▀▀▀█░▌ ▀▀▀▀▀▀▀▀▀█░▌▐░▌               ▐░▌          ▐░▌
▐░▌       ▐░▌          ▐░▌▐░▌               ▐░▌          ▐░▌
▐░▌       ▐░▌ ▄▄▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄▄▄  ▄▄▄▄█░█▄▄▄▄  ▄▄▄▄█░█▄▄▄▄
▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
 ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀
`,
  },

  // Dividers
  {
    title: "Celtic Border",
    category: "borders",
    sourceCategory: "ascii-borders/gallery",
    keywords: ["border", "celtic", "divider"],
    art: ` .--..--..--..--..--..--..--..--..--..--..--.
/ .. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\
\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/ /
\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /`,
  },

  // Dividers
  {
    title: "Spark Divider",
    category: "borders",
    sourceCategory: "ascii-dividers/gallery",
    keywords: ["divider", "separator", "spark", "line"],
    art: `--*--*--*--*--*--*--*--*--*--*--
  .  *  .   ASCIIFIER   .  *  .
--*--*--*--*--*--*--*--*--*--*--`,
    artist: "Asciifier",
  },
  {
    title: "Wave Divider",
    category: "borders",
    sourceCategory: "ascii-dividers/gallery",
    keywords: ["divider", "separator", "wave", "line"],
    art: `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ~~~  text art current  ~~~
------------------------------------`,
    artist: "Asciifier",
  },

  // Emoji-style
  {
    title: "Peace Sign",
    category: "emoji",
    sourceCategory: "one-line",
    keywords: ["peace", "face", "emoji"],
    art: `
    .-""""""-.
  .'          '.
 /   O      O   \\
:                :
|                |
:       __       :
 \\  .-"    "-.  /
  '.          .'
    '-......-'
`,
  },
];

// Get a random ASCII art piece
export function getRandomAscii(): AsciiArt {
  const randomIndex = Math.floor(Math.random() * asciiCollection.length);
  return asciiCollection[randomIndex];
}

// Get ASCII art by category
export function getAsciiByCategory(category: string): AsciiArt[] {
  return asciiCollection.filter((art) => art.category === category);
}

export function getAsciiBySourceCategory(sourceCategory: string): AsciiArt[] {
  return asciiCollection.filter((art) => art.sourceCategory === sourceCategory);
}

export function searchAsciiCollection(
  sourceCategory: string,
  query: string,
): AsciiArt[] {
  const trimmedQuery = query.trim().toLowerCase();
  const categoryMatches = sourceCategory
    ? getAsciiBySourceCategory(sourceCategory)
    : asciiCollection;

  if (!trimmedQuery) {
    return categoryMatches;
  }

  return categoryMatches.filter((art) => {
    const haystack = [
      art.title,
      art.artist || "",
      art.category,
      art.sourceCategory || "",
      art.keywords?.join(" ") || "",
      art.art,
    ].join(" ").toLowerCase();

    return haystack.includes(trimmedQuery);
  });
}

// Get all categories
export function getCategories(): string[] {
  return [...new Set(asciiCollection.map((art) => art.category))];
}
