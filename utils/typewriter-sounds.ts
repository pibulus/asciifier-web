/**
 * TypeWriter Sounds - Lightweight keyboard typing sounds for text inputs
 * Adapted from Juicy Sounds project - simplified for Deno/Fresh
 *
 * Usage:
 *   const typewriter = new TypeWriterSounds();
 *   typewriter.attach('input'); // Auto-init and attach
 */

export class TypeWriterSounds {
  private enabled: boolean;
  private volume: number;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private configData: any = null;
  private loaded: boolean = false;
  private attachedElements: Set<HTMLElement> = new Set();

  constructor(config: { volume?: number; enabled?: boolean } = {}) {
    this.volume = config.volume ?? 0.2; // Default lower volume
    this.enabled = config.enabled ?? true;
  }

  /**
   * Initialize and load the sound pack
   */
  async init(packName = "cherry-mx-black"): Promise<void> {
    if (this.loaded) return;

    try {
      // Create audio context (required for Web Audio API)
      if (typeof window === "undefined") return;

      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Load config and audio in parallel
      const basePath = `/sounds/keyboard-packs/${packName}/`;
      const [configResponse, audioResponse] = await Promise.all([
        fetch(basePath + "config.json"),
        fetch(basePath + "sound.ogg"),
      ]);

      this.configData = await configResponse.json();
      const arrayBuffer = await audioResponse.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.loaded = true;
      console.log("🎹 Keyboard sounds loaded:", this.configData.name);
    } catch (error) {
      console.warn("Keyboard sounds unavailable - continuing without audio");
      // Fail silently - typing still works without sounds
    }
  }

  /**
   * Play a key sound
   */
  play(event: KeyboardEvent): void {
    if (!this.enabled || !this.loaded) return;

    // Map the key to a sound ID
    const keyId = this.getKeyId(event);
    const soundData = this.configData?.defines?.[keyId];

    if (!soundData) {
      // Fallback to 'A' key sound
      const fallbackData = this.configData?.defines?.["65"];
      if (fallbackData) {
        this.playSound(fallbackData[0], fallbackData[1]);
      }
      return;
    }

    const [startMs, durationMs] = soundData;
    this.playSound(startMs, durationMs);
  }

  /**
   * Play a specific segment of the audio buffer
   */
  private playSound(startMs: number, durationMs: number): void {
    if (!this.audioBuffer || !this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Convert ms to seconds
    const startTime = startMs / 1000;
    const duration = durationMs / 1000;

    source.start(0, startTime, duration);
  }

  /**
   * Map keyboard event to Mechvibes key ID
   */
  private getKeyId(event: KeyboardEvent): string {
    const key = event.key;

    // Special keys
    const specialMap: Record<string, string> = {
      " ": "57", // Space
      "Enter": "28",
      "Backspace": "14",
      "Tab": "15",
      "Escape": "41",
      "Shift": "42",
      "Control": "17",
      "Alt": "18",
      "Meta": "3675",
      ".": "52",
      ",": "51",
      "/": "53",
      ";": "39",
      "'": "40",
      "[": "26",
      "]": "27",
    };

    if (specialMap[key]) return specialMap[key];

    // Letters A-Z
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      return String(key.toUpperCase().charCodeAt(0));
    }

    // Numbers 0-9
    if (key >= "0" && key <= "9") {
      if (key === "0") return "11";
      return String(parseInt(key) + 1);
    }

    // Default fallback
    return "65"; // 'A' key
  }

  /**
   * Attach to input elements
   */
  attach(selector = "input, textarea"): void {
    if (typeof document === "undefined") return;

    // Auto-initialize on first attach
    if (!this.loaded) {
      this.init();
    }

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      if (this.attachedElements.has(element as HTMLElement)) return;

      const handler = (e: Event) => this.play(e as KeyboardEvent);
      element.addEventListener("keydown", handler);
      (element as any)._typewriterHandler = handler;
      this.attachedElements.add(element as HTMLElement);
    });

    console.log(`🎹 Keyboard sounds attached to ${elements.length} elements`);
  }

  /**
   * Detach from elements
   */
  detach(): void {
    this.attachedElements.forEach((element) => {
      const handler = (element as any)._typewriterHandler;
      if (handler) {
        element.removeEventListener("keydown", handler);
        delete (element as any)._typewriterHandler;
      }
    });
    this.attachedElements.clear();
  }

  /**
   * Simple controls
   */
  enable(): void {
    this.enabled = true;
  }
  disable(): void {
    this.enabled = false;
  }
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.detach();
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
  }
}

// Singleton instance for easy use
let globalTypewriter: TypeWriterSounds | null = null;

export function getTypeWriter(): TypeWriterSounds {
  if (typeof window === "undefined") {
    // Server-side: return dummy instance
    return new TypeWriterSounds({ enabled: false });
  }

  if (!globalTypewriter) {
    globalTypewriter = new TypeWriterSounds();
  }
  return globalTypewriter;
}
