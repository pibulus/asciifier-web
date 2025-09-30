# 🔧 TINKER.md - JUICY-THEMES Quick Reference

_For when you haven't touched this in 6 months and need to change something NOW_

**ADHD MODE**: Jump to [QUICK WINS](#-quick-wins---80-of-what-youll-change) or
[WHEN SHIT BREAKS](#-when-shit-breaks---top-3-fixes)

---

## 🚀 START HERE - RUN THE DAMN THING

### Dev Mode

```bash
# STACK: DENO/FRESH
deno task start
# Opens: http://localhost:8001
```

### Production Build

```bash
deno task build
```

### Health Check

```bash
deno task check    # Format, lint, type check
```

---

## 📁 FILE MAP - WHERE SHIT LIVES

```
asciifier-web/
├── routes/
│   ├── index.tsx           # Main page - the beautiful UI
│   ├── _app.tsx           # App wrapper with themes
│   └── api/
│       ├── figlet.ts      # Text → ASCII API (THE MAGIC)
│       ├── colorize.ts    # Lolcat rainbow effects
│       └── joke.ts        # Random jokes
├── islands/
│   ├── Dropzone.tsx       # Drag & drop for images
│   ├── TextToAscii.tsx    # Text input → ASCII output
│   ├── ThemeIsland.tsx    # Theme switcher
│   └── TabsIsland.tsx     # Tab navigation
├── utils/
│   ├── character-sets.ts  # ASCII character mappings
│   ├── themes.ts         # Color themes & CSS vars
│   ├── image-processor.ts # Image → ASCII conversion
│   └── sounds.ts         # UI sound effects
├── static/
│   └── styles.css        # Global CSS & theme vars
└── deno.json            # Dependencies & tasks
```

### The Files You'll Actually Touch:

1. **routes/index.tsx** - Main page text, taglines, layout
2. **routes/api/figlet.ts** - Fonts, ASCII generation logic
3. **utils/themes.ts** - Colors, theme definitions
4. **static/styles.css** - Global styles, CSS variables
5. **deno.json** - Port, dependencies, tasks

---

## 🎯 QUICK WINS - 80% OF WHAT YOU'LL CHANGE

### 1. Change the Main Text/Copy

```
File: routes/index.tsx
Lines: 18-22
Current: "Turn ANYTHING into text art"
Change: Update taglines and descriptions
```

### 2. Add New Figlet Fonts

```
File: routes/api/figlet.ts
Look for: font = "standard"
Available fonts: big, block, bubble, digital, doom, epic, ghost, etc.
Add to options array for frontend
```

### 3. Change Colors/Theme

```
File: utils/themes.ts
Look for: brutalistDark, pastelPunk, retroWave themes
Current: --color-accent: #FF69B4
Options: Edit theme objects or create new themes
```

### 4. Modify Lolcat Effects

```
File: routes/api/colorize.ts
Look for: effect types
Current: rainbow, fire, ocean, unicorn, matrix
Add: New effect names to the enum and switch
```

### 5. Change Port

```
File: dev.ts and main.ts
Look for: :8001
Change to: :YOUR_PORT
```

---

## 🔧 COMMON TWEAKS

### Add a New Color Effect

```bash
# Edit the colorize API
File: routes/api/colorize.ts
1. Add effect name to type: 'youreffect'
2. Add case to switch statement
3. Update frontend effect options
```

### Add New ASCII Character Set

```bash
File: utils/character-sets.ts
1. Create new character array (light → dark)
2. Export with descriptive name
3. Update frontend dropdown options
```

### Change Themes

```bash
File: utils/themes.ts
1. Edit existing theme colors
2. Or add new theme object
3. Update theme switcher options
```

### Modify Main Layout

```bash
File: routes/index.tsx
- Header: lines 8-30
- Content tabs: <TabsIsland />
- Footer: bottom section
```

---

## 💥 WHEN SHIT BREAKS - TOP 3 FIXES

### 1. Port Already in Use (8001)

```bash
# Find what's using it:
lsof -i :8001

# Kill it:
kill -9 PID_NUMBER

# Or change port in dev.ts
```

### 2. Fresh Manifest Fucked

```bash
# Regenerate manifest:
deno task manifest

# If that fails:
rm fresh.gen.ts
deno task start  # Auto-regenerates
```

### 3. Dependencies Broken

```bash
# Clear cache:
rm deno.lock

# Reload dependencies:
deno cache --reload dev.ts

# If node_modules issues:
rm -rf node_modules
```

---

## 🚦 DEPLOYMENT - SHIP IT

### Deno Deploy (Recommended)

```bash
# First deploy (adds project ID to deno.json):
deployctl deploy --production

# Future deploys:
deno task build
deployctl deploy --prod
```

### Manual Deploy Steps

1. Build it: `deno task build`
2. Test it: `deno task preview` (or check localhost:8001)
3. Push it: `git push origin main`
4. Deploy: `deployctl deploy --prod`

---

## 🌈 API ENDPOINTS - THE SERVER-SIDE MAGIC

### POST /api/figlet

```json
{
  "text": "HELLO",
  "font": "big",
  "colorize": true,
  "effect": "rainbow"
}
```

### POST /api/colorize

```json
{
  "text": "plain text",
  "effect": "fire",
  "animate": false
}
```

### GET /api/joke

```bash
curl http://localhost:8001/api/joke
```

---

## 🎨 ENVIRONMENT VARIABLES

### Where They Live

```
File: .env.local (create if needed)
Format: KEY=value
```

### Available Options

- `PORT` - Server port (default: 8001)
- Any Deno Deploy vars get set in dashboard

---

## 📝 NOTES FOR FUTURE PABLO

### The Revolutionary Architecture Discovery:

- **Server-side terminal tools in browser** = GENIUS breakthrough
- Figlet + Lolcat running on server, serving rich HTML to browser
- ANSI-to-HTML conversion for Gmail paste compatibility
- No client-side CLI emulation needed!

### Pablo's Project Quirks:

- **Rainbow Wizard Mode**: The lolcat effects are PERFECT
- **Pastel-punk aesthetic**: CSS vars system for easy theming
- **80/20 energy**: Focused on the essential ASCII magic
- **Terminal-to-web pipeline**: Converts shell tools to web APIs

### Technical Innovations:

- Fresh/Deno for modern server-side rendering
- CSS custom properties for dynamic theming
- Islands architecture for interactive components
- Server-side ASCII generation with client-side polish

---

## 🎸 TLDR - COPY PASTE ZONE

```bash
# Start working
deno task start

# Ship it
deno task build && deployctl deploy --prod

# When broken
rm deno.lock fresh.gen.ts
deno task start
```

**Quick paths:**

- Text/copy: `routes/index.tsx` (lines 18-22)
- Colors: `utils/themes.ts`
- API logic: `routes/api/figlet.ts`
- Main layout: `routes/index.tsx`

**Live URL:** http://localhost:8001 **Architecture:** Deno/Fresh + Figlet +
LolcatJS + Tailwind **The Magic:** Server-side terminal tools → Rich browser
experience

---

_"Server-side terminal tools in browsers = Revolutionary architecture!" 🌈⚡_

**Generated from the legendary Rainbow ASCII breakthrough session** 🚀
