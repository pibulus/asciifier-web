# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📁 Repository Overview

**ASCIIFIER-WEB** is Pablo's revolutionary ASCII art generator web application that brings terminal magic to browsers. This project represents a breakthrough in architecture: running server-side terminal tools (Figlet + LolcatJS) through web APIs to create rich, colorful ASCII art experiences.

## 🏗 Project Architecture & Key Innovation

### The Rainbow Wizard Architecture™
This project pioneered a revolutionary approach: **Server-side terminal tools → API endpoints → Rich browser UI**

**Why This Is Genius:**
- Terminal tools (figlet, lolcat) run natively on server
- ANSI color codes converted to HTML for browser display
- Rich Gmail paste compatibility with embedded styling
- No client-side CLI emulation needed
- Full power of terminal tools in web browsers

### Tech Stack
- **Framework**: Deno/Fresh with Islands architecture
- **Server Tools**: Figlet (ASCII art generation) + LolcatJS (rainbow effects)
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Deployment**: Deno Deploy ready
- **Port**: 8001 (development)

## 🎯 Core Features

1. **Text to ASCII Art**: Multiple figlet fonts with rainbow colorization
2. **Image to ASCII**: Upload images, convert to ASCII art
3. **Color Effects**: Rainbow, fire, ocean, unicorn, matrix effects via lolcat
4. **Dynamic Themes**: Pastel-punk, brutalist dark, retro wave
5. **Export Options**: Plain text, HTML, clipboard copy
6. **Sound Effects**: UI feedback with terminal-inspired sounds

## 🗂 File Structure & Conventions

### Directory Layout
```
asciifier-web/
├── routes/           # Fresh routes (pages + API)
├── islands/          # Interactive client components
├── utils/            # Core business logic
├── static/           # CSS, assets
├── components/       # Shared UI components
└── deno.json        # Dependencies & task configuration
```

### Key Files
- **routes/index.tsx**: Main application UI
- **routes/api/figlet.ts**: Core ASCII generation API
- **routes/api/colorize.ts**: Lolcat color effects API
- **islands/TextToAscii.tsx**: Text input interface
- **islands/Dropzone.tsx**: Image upload interface
- **utils/themes.ts**: Theme system & CSS variables

## 🛠 Development Commands

```bash
# Start development server (port 8001)
deno task start

# Production build
deno task build

# Format, lint, and type check
deno task check

# Generate Fresh manifest
deno task manifest

# Preview production build
deno task preview
```

## 🎨 Design Philosophy & Style

### Pablo's Aesthetic DNA
- **Pastel-Punk Brutalism**: Soft colors, chunky 4px borders, hard shadows
- **Rainbow Wizard Energy**: Colorful, magical, joyful ASCII art
- **80/20 Principle**: Essential features that spark joy
- **Neo-Toybrut Design**: Playful, approachable, personality-driven

### Code Style
- **Fresh Islands**: Interactive components as islands
- **CSS Custom Properties**: Dynamic theming with `--color-*` variables
- **TypeScript**: Full type safety with strict mode
- **Server-First**: Core logic runs server-side for performance

## 🔌 API Architecture

### Core Endpoints
- **POST /api/figlet**: Text → ASCII art with fonts + colors
- **POST /api/colorize**: Apply lolcat rainbow effects
- **GET /api/joke**: Random programming jokes

### Revolutionary Approach
- Terminal tools run server-side in Deno runtime
- ANSI color codes converted to HTML spans
- Rich clipboard formats for Gmail pasting
- Full font selection without client-side dependencies

## 🚀 Deployment & Production

### Deno Deploy Setup
```bash
# First deployment (adds project ID to deno.json)
deployctl deploy --production

# Subsequent deployments
deno task build
deployctl deploy --prod
```

### Environment Variables
- `PORT`: Development server port (default: 8001)
- Deno Deploy handles production environment automatically

## 🧩 Common Development Patterns

### Adding New Figlet Fonts
1. Update font options in `routes/api/figlet.ts`
2. Add to frontend dropdown in text input components
3. Test with various text inputs

### Creating New Color Effects
1. Add effect name to type definition in `routes/api/colorize.ts`
2. Implement effect logic in switch statement
3. Update frontend effect selector

### Theme System Usage
```typescript
// In utils/themes.ts
export const newTheme = {
  name: 'New Theme',
  colors: {
    '--color-base': '#FFFFFF',
    '--color-accent': '#FF69B4'
  }
}
```

## 🎭 Project Character & Personality

### The Rainbow ASCII Legend
This project emerged from a legendary breakthrough session where Pablo discovered how to bring terminal magic to browsers. The moment of "server-side terminal tools in browser = GENIUS architecture" became the foundation for a new approach to web applications.

### Core Values
- **Compression > Complexity**: Essential ASCII magic, nothing more
- **Joy First**: Every interaction should spark delight
- **Terminal Heritage**: Honor the beauty of command-line tools
- **Accessibility**: ASCII art works everywhere

## 🔧 Troubleshooting

### Common Issues
1. **Port 8001 in use**: `lsof -i :8001` then `kill -9 PID`
2. **Fresh manifest errors**: `deno task manifest` to regenerate
3. **Dependency issues**: `rm deno.lock` and restart
4. **Color effects broken**: Check lolcat import in colorize API

### Debug Commands
```bash
# Check server health
curl http://localhost:8001/api/joke

# Test figlet API
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"TEST","font":"big","colorize":true}' \
  http://localhost:8001/api/figlet
```

## 📚 Technical References

### Dependencies
- **Fresh**: Modern Deno web framework
- **Figlet**: ASCII art generation (npm:figlet@^1.7.0)
- **LolcatJS**: Rainbow text effects (npm:lolcatjs@^2.4.3)
- **Tailwind**: Utility-first CSS framework
- **Preact**: Lightweight React alternative

### Architecture Patterns
- **Islands**: Interactive components hydrate on client
- **API Routes**: Server-side logic in Fresh routes/api/
- **CSS Variables**: Dynamic theming without JS
- **Signals**: Preact signals for reactive state

---

## 🌟 The Legacy

This project represents a breakthrough in web architecture: proving that terminal tools can be beautifully integrated into modern web experiences without sacrificing their power or character. The Rainbow Wizard Architecture pioneered here opens new possibilities for bringing command-line magic to browser interfaces.

**"Server-side terminal tools in browsers = Revolutionary architecture!"** 🌈⚡

*Built with 80/20 energy during the legendary Rainbow ASCII breakthrough session*