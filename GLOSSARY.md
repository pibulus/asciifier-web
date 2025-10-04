# Glossary - Asciifier Web

## Islands (Interactive Components)
- `AsciiGallery` - Gallery of pre-made ASCII art examples (islands/AsciiGallery.tsx)
- `Dropzone` - Drag-and-drop image upload zone (islands/Dropzone.tsx)
- `TextToAscii` - Text input → ASCII art converter (islands/TextToAscii.tsx)
- `ThemeIsland` - Theme switcher UI (islands/ThemeIsland.tsx)
- `TabsIsland` - Main tab navigation container (islands/TabsIsland.tsx)
- `TabSwitcher` - Individual tab switcher logic (islands/TabSwitcher.tsx)
- `AboutModal` - About/info modal dialog (islands/AboutModal.tsx)
- `KofiModal` - Ko-fi donation modal (islands/KofiModal.tsx)
- `WelcomeChecker` - First-visit welcome flow (islands/WelcomeChecker.tsx)
- `WelcomeModal` - Welcome message modal (islands/WelcomeModal.tsx)

## Components (Shared UI)
- `Button` - Styled button component (components/Button.tsx)
- `MagicDropdown` - Animated dropdown selector (components/MagicDropdown.tsx)
- `TerminalDisplay` - ASCII art output display (components/TerminalDisplay.tsx)

## API Routes
- `POST /api/enhanced-figlet` - Text → ASCII with fonts + HSL color effects (routes/api/enhanced-figlet.ts)
- `GET /api/joke` - Random ASCII joke generator (routes/api/joke.ts)
- `GET /api/random-ascii-art` - Random ASCII art from collection (routes/api/random-ascii-art.ts)

## Key Functions
- `openAboutModal()` - Show about modal (islands/AboutModal.tsx)
- `closeAboutModal()` - Hide about modal (islands/AboutModal.tsx)
- `openKofiModal()` - Show Ko-fi modal (islands/KofiModal.tsx)
- `closeKofiModal()` - Hide Ko-fi modal (islands/KofiModal.tsx)
- `checkWelcomeStatus()` - Check if user has seen welcome (islands/WelcomeModal.tsx)
- `markWelcomeSeen()` - Mark welcome as viewed (islands/WelcomeModal.tsx)

## Core Concepts
- **Rainbow Wizard Architecture** - Server-side Figlet + custom HSL gradients → browser magic
- **HSL Color Effects** - Mathematical color gradients (unicorn, fire, cyberpunk, etc.)
- **Figlet** - Server-side ASCII art generation engine
- **Islands Architecture** - Fresh framework pattern for selective hydration
- **Destructible Stickers** - Ephemeral UI feedback elements
