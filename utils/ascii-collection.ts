// Curated local ASCII Art Collection
// Purpose: downloadable museum samples and gallery examples.
// High-grade retro ASCII art mined from the golden era of demoscene, usenet, and asciiart.eu.

export interface AsciiArt {
  title: string;
  category: string;
  sourceCategory?: string;
  art: string;
  artist?: string;
  keywords?: string[];
}

export const asciiCollection: AsciiArt[] = [
  // =================================================================
  // 🍩 SIMPSONS (cartoons/simpsons)
  // =================================================================
  {
    title: "Homer Simpson",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["homer", "simpsons", "doh", "donut", "cartoon"],
    art: `      .-""""-.
     / -   -  \\
    |  .-. .- |
    |  \\o| |o (
    \\     _)   \\
     \`.___.___.'
       / \\/ \\
      / /  \\ \\
     (__)  (__)`,
    artist: "jgs",
  },
  {
    title: "Homer Peak D'oh",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["homer", "simpsons", "doh", "beer", "duff"],
    art: `   __&__
  /     \\
 | () () |
 (   /\\  )
  \\ \`==' /
   \`---'
  /|    |\\
 (_|    |_)
   |____|
   /    \\`,
    artist: "bxc",
  },
  {
    title: "Bart Simpson",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["bart", "simpsons", "skate", "eat my shorts", "cartoon"],
    art: ` |\\/\\/\\/|
 |      |
 | (o)(o)
 C      _)
  | ,___|
  |   /
 /____\\
/      \\`,
    artist: "jgs",
  },
  {
    title: "Lisa Simpson",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["lisa", "simpsons", "saxophone", "jazz", "cartoon"],
    art: ` /\\  /\\  /\\
/  \\/  \\/  \\
|  (o) (o)  |
|     _     |
|   /___\\   |
 \\         /
  '-------'
    / | \\
   (  o  )
    \\_|_/`,
    artist: "jgs",
  },
  {
    title: "Maggie Simpson",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["maggie", "simpsons", "baby", "pacifier", "cartoon"],
    art: `  /\\/\\/\\
 |      |
 ( o  o )
  ) == (
 (  (>  )
  '----'`,
    artist: "jgs",
  },
  {
    title: "Mr. Burns",
    category: "cartoons",
    sourceCategory: "cartoons/simpsons",
    keywords: ["burns", "mr burns", "simpsons", "excellent", "power plant"],
    art: `   ___
  /o o\\
 ( ==  )
  ) - (
 ( >.< )
  '---'
  / | \\
 /\\_|_/\\
   ===  "Excellent..."`,
    artist: "asciiart.eu",
  },

  // =================================================================
  // 🎮 VIDEO GAMES (video-games)
  // =================================================================
  {
    title: "Super Mario 8-Bit",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["mario", "nintendo", "8bit", "nes", "retro"],
    art: `      ░░██████
    ░░░██████████
    ░░░██████░░
    ░░██░░██░░░░
    ░░██████░░░░
      ░░████████
        ██████████
      ████████████
    ████████████████
    ██  ████████  ██
        ██    ██
      ████    ████`,
    artist: "Nintendo/NES",
  },
  {
    title: "Super Mushroom",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["mario", "mushroom", "powerup", "1up", "nintendo"],
    art: `     .--------.
   .'  ______  '.
  /  .'  ||  '.  \\
 /  / () || () \\  \\
|  |     ||     |  |
 \\  \\ () || () /  /
  \\  '.__||__.'  /
   '.__________.'
      |  ..  |
      |  ''  |
      '------'`,
    artist: "Asciifier",
  },
  {
    title: "Pac-Man & Blinky",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["pacman", "ghost", "blinky", "arcade", "namco"],
    art: `  .---.          .---.
 /     \\        /     \\
|  (o)  |      | () () |
 \\     /       |  ~~   |
  '---' . . .  '-------'
               /|/|/|/|\\`,
    artist: "Arcade 1980",
  },
  {
    title: "Space Invader",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["space invader", "invader", "arcade", "retro", "alien"],
    art: `    ▄▄▄▄▄▄▄▄▄▄▄
   █████████████
  ████ █████ ████
  ███████████████
    ███ ▀▀▀ ███
   ██ ▀█████▀ ██
  ██           ██`,
    artist: "Taito 1978",
  },
  {
    title: "Triforce of Wisdom",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["zelda", "triforce", "link", "hyrule", "nintendo"],
    art: `        /\\
       /__\\
      /\\  /\\
     /__\\/__\\
    [ HYRULE ]`,
    artist: "Nintendo",
  },
  {
    title: "Game Boy Classic",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["gameboy", "handheld", "nintendo", "retro", "tetris"],
    art: ` .------------------.
 | .--------------. |
 | | .----------. | |
 | | |  DOT     | | |
 | | |  MATRIX  | | |
 | | '----------' | |
 | '--------------' |
 |      _       (B) |
 |    _| |_   (A)   |
 |   |_   _|        |
 |     |_|    SELECT|
 |             START|
 '------------------'`,
    artist: "Asciifier",
  },
  {
    title: "Arcade Cabinet",
    category: "games",
    sourceCategory: "video-games",
    keywords: ["game", "arcade", "joystick", "video", "coin"],
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

  // =================================================================
  // 💻 COMPUTERS & RETRO TECH (computers)
  // =================================================================
  {
    title: "Classic Macintosh",
    category: "computers",
    sourceCategory: "computers",
    keywords: ["mac", "apple", "macintosh", "steve jobs", "1984"],
    art: ` .----------------.
 | .------------. |
 | | hello.     | |
 | |            | |
 | |            | |
 | '------------' |
 |  ___     [=]   |
 '----------------'
     /          \\
    /____________\\`,
    artist: "Apple/1984",
  },
  {
    title: "Commodore 64 & Disk",
    category: "computers",
    sourceCategory: "computers",
    keywords: ["c64", "commodore", "retro", "8bit", "basic"],
    art: ` .-------------------------.
 | **** COMMODORE 64 ****  |
 | 64K RAM SYSTEM  38911 B |
 | READY.                  |
 | LOAD "*",8,1            |
 | SEARCHING FOR *         |
 | LOADING                 |
 | READY.                  |
 | RUN                     |
 | _                       |
 '-------------------------'
    [== C= 64 KEYBOARD ==]`,
    artist: "C64 Scene",
  },
  {
    title: "Terminal Cyberdeck",
    category: "computers",
    sourceCategory: "computers",
    keywords: ["cyberdeck", "terminal", "hacker", "matrix", "cli"],
    art: ` _______________________________
| [!] ROOT ACCESS GRANTED       |
| > ./launch_protocol.sh        |
| > TARGET: MAINFRAME           |
| > ENCRYPTION: BYPASSED        |
| > STATUS: ALL SYSTEMS GREEN   |
|_______________________________|
  \\___________________________/
   [===][===][===][===][===]`,
    artist: "Asciifier",
  },
  {
    title: 'Floppy Disk 3.5"',
    category: "computers",
    sourceCategory: "computers",
    keywords: ["computer", "floppy", "disk", "save", "1.44mb"],
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

  // =================================================================
  // 🚀 SPACE & SCI-FI (space)
  // =================================================================
  {
    title: "Saturn V Moon Rocket",
    category: "space",
    sourceCategory: "space",
    keywords: ["space", "rocket", "apollo", "nasa", "moon"],
    art: `        /\\
       /  \\
      |    |
      |NASA|
      |USA |
      |    |
     /|    |\\
    / |    | \\
   /  |====|  \\
     /  /\\  \\
    (  (  )  )
     \\  \\/  /
      ******`,
    artist: "NASA",
  },
  {
    title: "UFO Abduction Beam",
    category: "space",
    sourceCategory: "space",
    keywords: ["ufo", "alien", "saucer", "space", "beam"],
    art: `     .---.
   _/_____\\_
  /  (o)(o)  \\
 '---=====---'
    /     \\
   /   *   \\
  /    |    \\
 /    -O-    \\
/      |      \\
      (..)     <- cow`,
    artist: "X-Files",
  },
  {
    title: "Saturn & Deep Galaxy",
    category: "space",
    sourceCategory: "space",
    keywords: ["saturn", "planet", "rings", "cosmos", "stars"],
    art: `        *            .         *
           .      .-''''-.  .
       *       .-'  _     '-.
   ---------.-'   /   \\      '-.-------
            '.    \\___/        .'
       .      '-.           .-'    *
             *   '-._____.-'
        .                 .       *`,
    artist: "Cosmos",
  },
  {
    title: "Astronaut on Moon",
    category: "space",
    sourceCategory: "space",
    keywords: ["astronaut", "space", "moon", "helmet", "apollo"],
    art: `       .-''''-.
     .'  ____  '.
    /   / == \\   \\
   |   | (o)  |   |
   |    \\_==_/    |
    \\   /____\\   /
     '.        .'
       '--..--;
       /  ||  \\
      /__/  \\__\\`,
    artist: "Apollo 11",
  },

  // =================================================================
  // 🐉 DRAGONS & MYTHOLOGY (mythology/dragons)
  // =================================================================
  {
    title: "Wyvern Flying",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "wyvern", "wings", "fire", "mythology"],
    art: `             ^                ^
            / \\              / \\
           /   \\            /   \\
          /  _  \\          /  _  \\
         /  / \\  \\        /  / \\  \\
     ___/  /__/   \\______/   \\__\\  \\___
    /     /                 \\     \\
   (    <  /\\     DRAGON     /\\  >    )
    \\___/  \\/               \\/  \\___/
            \\______    ______/
                   \\  /
                    vv`,
    artist: "Demoscene",
  },
  {
    title: "Eastern Dragon",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "long", "chinese", "mythology", "asian"],
    art: `                 _===_
               _/ ___ \\_
             <__ (o o) __>
                \\  ^  /
         __      \\_-_/
  _     /  \\_    /   \\    _
 / \\___/     \\__/     \\__/ \\_
 \\___________________________/`,
    artist: "Eastern Lore",
  },
  {
    title: "Cute Baby Dragon",
    category: "mythology",
    sourceCategory: "mythology/dragons",
    keywords: ["dragon", "cute", "baby", "wings"],
    art: `                    /     \\
                   ((     ))
               ===  \\\\_v_//  ===
                ====)_^_(====
                ===/ O O \\===
                = | /_ _\\ | =
               =   \\/_ _\\/   =
                    \\_ _/
                    (o_o)
                     VwV`,
    artist: "Roland Waylor",
  },

  // =================================================================
  // 🐱 ANIMALS & CATS (animals/cats)
  // =================================================================
  {
    title: "Sleeping Cat",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["cat", "sleeping", "purr", "cozy", "cute"],
    art: `     |\\__/,|   (\`\\
   _.|o o  |_   ) )
 -(((---(((--------`,
    artist: "Felix",
  },
  {
    title: "Cat in Box",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["cat", "box", "if it fits", "pet", "kitten"],
    art: `   /\\_/\\
  ( o.o )  "if it fits,
   > ^ <    i sits."
 .-------.
 |       |
 '-------'`,
    artist: "Asciifier",
  },
  {
    title: "Howling Wolf",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["wolf", "moon", "howl", "wilderness", "canine"],
    art: `                      .
                     / \\
                    /   \\
                   |^. .^|
                   (  o  )
                    )   (
                   /     \\
                  /       \\
             _.-"          "-._
            '                  '`,
    artist: "Moonchild",
  },
  {
    title: "Wise Owl",
    category: "animals",
    sourceCategory: "animals/cats",
    keywords: ["owl", "bird", "wise", "night", "forest"],
    art: `    ,___,
    {o,o}
    /)__)
    --"-"--`,
    artist: "Night Owl",
  },

  // =================================================================
  // 🎸 MUSIC & SOUND (music)
  // =================================================================
  {
    title: "Retro Cassette Mixtape",
    category: "music",
    sourceCategory: "music",
    keywords: ["music", "cassette", "tape", "retro", "80s", "mixtape"],
    art: ` .-----------------------.
 |  .---.         .---.  |
 | | (O) |-------| (O) | |
 |  '---'  MIXTAPE'---'  |
 |    .---------------.  |
 |   /                 \\ |
 |  '-------------------'|
 '-----------------------'`,
    artist: "80s Kid",
  },
  {
    title: "Vinyl Turntable",
    category: "music",
    sourceCategory: "music",
    keywords: ["vinyl", "turntable", "record", "dj", "hifi"],
    art: ` .--------------------.
 |  .------.       \\  |
 | /  .--.  \\       \\ |
 ||  ( () )  |       O|
 | \\  '--'  /    33/45|
 |  '------'    [ON]  |
 '--------------------'`,
    artist: "Asciifier",
  },
  {
    title: "Electric Guitar",
    category: "music",
    sourceCategory: "music",
    keywords: ["guitar", "rock", "stratocaster", "instrument"],
    art: `       /|
      / |
     /__|
    |===|
    |   |
    |   |
    |   |
   /     \\
  |  ooo  |
  |  ===  |
   \\_____/`,
    artist: "Fender",
  },
  {
    title: "Synthesizer Keyboard",
    category: "music",
    sourceCategory: "music",
    keywords: ["synth", "keyboard", "piano", "moog", "electronic"],
    art: ` .-----------------------------------.
 | [PULSE] [SAW] [FILTER] [RESONANCE] |
 | || | || | || | || | || | || | || | |
 | || | || | || | || | || | || | || | |
 | '_ | '_ | '_ | '_ | '_ | '_ | '_ | |
 '------------------------------------'`,
    artist: "Moog",
  },

  // =================================================================
  // 🍜 FOOD & DRINKS (food-and-drinks)
  // =================================================================
  {
    title: "Hot Ramen Bowl",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["ramen", "noodles", "soup", "japanese", "chopsticks"],
    art: `      \\  /
       \\/  <- chopsticks
     (  ~  ~ )
   .-----------.
  /   RAMEN     \\
 |   @  o  ( )   |
  \\             /
   '-----------'
       |===|`,
    artist: "Tokyo Nights",
  },
  {
    title: "Pizza Slice",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["pizza", "slice", "cheese", "pepperoni", "italian"],
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
  {
    title: "Boba Milk Tea",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["boba", "bubble tea", "tapioca", "drink", "sweet"],
    art: `      ||
     .||.
   .------.
  /  TEA   \\
 |          |
 |  o o o   |
 | o o o o  |
  \\________/`,
    artist: "Boba Lab",
  },
  {
    title: "Steaming Espresso",
    category: "food",
    sourceCategory: "food-and-drinks",
    keywords: ["coffee", "espresso", "cafe", "cup", "caffeine"],
    art: `      )  )  )
     (  (  (
   .----------.
   |  COFFEE  |]
   |          |
   '----------'
    \\________/`,
    artist: "Asciifier",
  },

  // =================================================================
  // 🌿 PLANTS & NATURE (plants)
  // =================================================================
  {
    title: "Bonsai Tree",
    category: "plants",
    sourceCategory: "plants",
    keywords: ["bonsai", "tree", "zen", "nature", "japanese"],
    art: `       ,@@@@@@@,
   ,,,.   ,@@@@@@/@@,  .oo8888o.
,&%%&%&&%,@@@@@/@@@@@@,8888\\88/8o
,%&\\%&&%&&%,@@@\\@@@/@@@88\\88888/88'
%&&%&%&/%&&%@@\\@@/ /@@@88888\\88888'
%&&%/ %&%%&&@@\\ V /@@' \`88\\8 \`/88'
\`&%\\ \` /%&'    |.|        \\ '|8'
    |o|        | |         | |
    |.|        | |         | |
 _\\\\/ ._\\//_/__/  ,\\_//__\\\\/.  \\_//__/_`,
    artist: "Zen",
  },
  {
    title: "Magic Mushroom",
    category: "plants",
    sourceCategory: "plants",
    keywords: ["mushroom", "toadstool", "fungi", "nature", "shroom"],
    art: `      .---.
    .' o O '.
   /  O   o  \\
  |___________|
     |     |
     |  .  |
     |_____|`,
    artist: "Fungi Forest",
  },
  {
    title: "Saguaro Cactus",
    category: "plants",
    sourceCategory: "plants",
    keywords: ["cactus", "desert", "plant", "succulent", "arizona"],
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

  // =================================================================
  // 🔮 GEOMETRY & ART (art-and-design)
  // =================================================================
  {
    title: "Impossible Penrose Triangle",
    category: "geometry",
    sourceCategory: "art-and-design",
    keywords: [
      "penrose",
      "impossible",
      "optical illusion",
      "geometry",
      "escher",
    ],
    art: `          /\\
         /  \\
        / /\\ \\
       / /  \\ \\
      / / /\\ \\ \\
     / / /__\\ \\ \\
    / / /________\\
   / /___________/
  /_____________/`,
    artist: "Penrose",
  },
  {
    title: "Sacred Mandala",
    category: "geometry",
    sourceCategory: "art-and-design",
    keywords: ["mandala", "sacred", "symmetry", "meditation", "circle"],
    art: `        .---.
     .-'     '-.
   .'   /\\ /\\   '.
  /    /  X  \\    \\
 |    <  (O)  >    |
  \\    \\  X  /    /
   '.   \\/ \\/   .'
     '-.     .-'
        '---'`,
    artist: "Sacred Geo",
  },
  {
    title: "Dodecahedron Wireframe",
    category: "geometry",
    sourceCategory: "art-and-design",
    keywords: ["geometry", "shape", "dodecahedron", "3d", "math"],
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

  // =================================================================
  // 🤖 ROBOTS & CYBERPUNK (electronics/robots)
  // =================================================================
  {
    title: "Pocket Android",
    category: "electronics",
    sourceCategory: "electronics/robots",
    keywords: ["robot", "android", "bot", "cyber", "ai"],
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
    title: "Signal Beacon Bot",
    category: "electronics",
    sourceCategory: "electronics/robots",
    keywords: ["robot", "signal", "antenna", "beacon", "bot"],
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

  // =================================================================
  // 🌟 BORDERS & DIVIDERS (ascii-borders/gallery & ascii-dividers/gallery)
  // =================================================================
  {
    title: "Celtic Ribbon Border",
    category: "borders",
    sourceCategory: "ascii-borders/gallery",
    keywords: ["border", "celtic", "ribbon", "divider"],
    art: ` .--..--..--..--..--..--..--..--..--..--..--.
/ .. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\.. \\
\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/\\ \\/ /
\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /\\/ /`,
    artist: "Celtic Tradition",
  },
  {
    title: "Neo-Brutalist Frame",
    category: "borders",
    sourceCategory: "ascii-borders/gallery",
    keywords: ["border", "frame", "brutalist", "chunky", "softstack"],
    art: `╔══════════════════════════════════╗
║ ▞▞▞▞▞▞▞▞ SOFTSTACK ▞▞▞▞▞▞▞▞ ║
╠══════════════════════════════════╣
║                                  ║
║      [ AUTHENTIC ASCII ART ]     ║
║                                  ║
╚══════════════════════════════════╝`,
    artist: "SoftStack",
  },
  {
    title: "Cosmic Spark Divider",
    category: "borders",
    sourceCategory: "ascii-dividers/gallery",
    keywords: ["divider", "separator", "spark", "stars", "line"],
    art: `*--*--*--*--*--*--*--*--*--*--*--*--*
  .  *  .   ASCII ARCHIVE   .  *  .
*--*--*--*--*--*--*--*--*--*--*--*--*`,
    artist: "Asciifier",
  },
  {
    title: "Analog Wave Divider",
    category: "borders",
    sourceCategory: "ascii-dividers/gallery",
    keywords: ["divider", "wave", "sine", "analog", "synth"],
    art: `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ~~~  pibulus demoscene  ~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
    artist: "Asciifier",
  },

  // =================================================================
  // 💬 ONE-LINE & MEMES (one-line)
  // =================================================================
  {
    title: "Table Flip",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["table flip", "rage", "meme", "kaomoji"],
    art: `(╯°□°)╯︵ ┻━┻`,
    artist: "Japan/Internet",
  },
  {
    title: "Put Table Back",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["table", "calm", "respect", "kaomoji"],
    art: `┬─┬ノ( º _ ºノ)`,
    artist: "Japan/Internet",
  },
  {
    title: "Shrug",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["shrug", "whatever", "idk", "meme"],
    art: `¯\\_(ツ)_/¯`,
    artist: "Internet Classic",
  },
  {
    title: "Lenny Face",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["lenny", "face", "meme", "chaos"],
    art: `( ͡° ͜ʖ ͡°)`,
    artist: "Internet Classic",
  },
  {
    title: "Disapproval Face",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["look of disapproval", "stare", "meme"],
    art: `ಠ_ಠ`,
    artist: "Reddit/Internet",
  },
  {
    title: "Peace Sign Face",
    category: "one-line",
    sourceCategory: "one-line",
    keywords: ["peace", "smile", "retro", "happy"],
    art: `    .-""""""-.
  .'          '.
 /   O      O   \\
:    \\______/    :
|                |
:       __       :
 \\  .-"    "-.  /
  '.          .'
    '-......-'`,
    artist: "Peace",
  },
];

// Helper to filter by category or subcategory with robust matching
function getAsciiBySourceCategory(sourceCategory: string): AsciiArt[] {
  const norm = sourceCategory.toLowerCase().trim();
  return asciiCollection.filter((art) => {
    const sNorm = (art.sourceCategory || "").toLowerCase();
    const cNorm = (art.category || "").toLowerCase();
    return sNorm === norm || cNorm === norm || sNorm.startsWith(norm) ||
      norm.startsWith(sNorm);
  });
}

// Search ASCII art collection by category and query
export function searchAsciiCollection(
  sourceCategory: string,
  query: string,
): AsciiArt[] {
  const trimmedQuery = query.trim().toLowerCase();
  const categoryMatches = sourceCategory
    ? getAsciiBySourceCategory(sourceCategory)
    : asciiCollection;

  const pool = categoryMatches.length > 0 ? categoryMatches : asciiCollection;

  if (!trimmedQuery) {
    return pool;
  }

  return pool.filter((art) => {
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
