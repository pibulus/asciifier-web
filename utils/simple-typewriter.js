/**
 * SimpleTypeWriter - Ultra-simple typing sounds using real mechanical keyboard recordings
 * One mode, one pack, amazing sounds!
 */

export class SimpleTypeWriter {
  constructor(config = {}) {
    this.config = {
      volume: 0.3,
      enabled: true,
      pack: "cherry-mx-black", // Default pack
      ...config,
    };

    this.enabled = this.config.enabled;
    this.audioContext = null;
    this.audioBuffer = null;
    this.configData = null;
    this.loaded = false;
    this.loadingPack = null;
    this.attachedElements = new Set();
  }

  /**
   * Initialize and load the sound pack
   */
  async init(packName = null) {
    // Use provided pack or default
    const pack = packName || this.config.pack;

    // If already loaded this pack, return
    if (this.loaded && this.loadingPack === pack) return;

    // Mark as loading this pack
    this.loadingPack = pack;
    this.loaded = false;

    try {
      // Create audio context (required for Web Audio API)
      if (!this.audioContext) {
        this.audioContext =
          new (window.AudioContext || window.webkitAudioContext)();
      }

      // Load the config and audio in parallel
      const basePath = `/sounds/keyboard-packs/${pack}/`;
      const [configResponse, audioResponse] = await Promise.all([
        fetch(basePath + "config.json"),
        fetch(basePath + "sound.ogg"),
      ]);

      this.configData = await configResponse.json();
      const arrayBuffer = await audioResponse.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.loaded = true;
      this.config.pack = pack;
      console.log("🎹 Keyboard sounds loaded:", this.configData.name);
    } catch (error) {
      console.error("Failed to load keyboard sounds:", error);
      // Fail silently - typing still works without sounds
    }
  }

  /**
   * Switch to a different sound pack
   */
  async setPack(packName) {
    await this.init(packName);
  }

  /**
   * Play a key sound
   */
  async play(event) {
    if (!this.enabled || !this.loaded) return;

    // Map the key to a sound ID
    const keyId = this.getKeyId(event);
    const soundData = this.configData.defines[keyId];

    if (!soundData) {
      // Try a fallback for unmapped keys
      const fallbackId = "65"; // Use 'A' key sound as fallback
      const fallbackData = this.configData.defines[fallbackId];
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
  playSound(startMs, durationMs) {
    if (!this.audioBuffer || !this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.config.volume;

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
  getKeyId(event) {
    const key = event.key;
    const code = event.keyCode || event.which;

    // Special keys first
    const specialMap = {
      " ": "57", // Space
      "Enter": "28", // Enter
      "Backspace": "14", // Backspace
      "Tab": "15", // Tab
      "Escape": "41", // Escape
      "Shift": "42", // Shift
      "Control": "17", // Control
      "Alt": "18", // Alt
      "Meta": "3675", // Cmd/Win
      ".": "52", // Period
      ",": "51", // Comma
      "/": "53", // Slash
      ";": "39", // Semicolon
      "'": "40", // Quote
      "[": "26", // Left bracket
      "]": "27", // Right bracket
    };

    if (specialMap[key]) return specialMap[key];

    // Letters A-Z (65-90)
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      return String(key.toUpperCase().charCodeAt(0));
    }

    // Numbers 0-9
    if (key >= "0" && key <= "9") {
      // Mechvibes uses 1-10 for number keys
      if (key === "0") return "11";
      return String(parseInt(key) + 1);
    }

    // Default fallback
    return "65"; // 'A' key
  }

  /**
   * Attach to input elements
   */
  attach(selector = "input, textarea") {
    // Auto-initialize on first attach
    if (!this.loaded) {
      this.init();
    }

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      if (this.attachedElements.has(element)) return;

      const handler = (e) => this.play(e);
      element.addEventListener("keydown", handler);
      element._typewriterHandler = handler;
      this.attachedElements.add(element);
    });

    console.log(`🎹 Keyboard sounds attached to ${elements.length} elements`);
  }

  /**
   * Detach from elements
   */
  detach() {
    this.attachedElements.forEach((element) => {
      if (element._typewriterHandler) {
        element.removeEventListener("keydown", element._typewriterHandler);
        delete element._typewriterHandler;
      }
    });
    this.attachedElements.clear();
  }

  /**
   * Simple controls
   */
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  setVolume(v) {
    this.config.volume = Math.max(0, Math.min(1, v));
  }

  /**
   * Cleanup
   */
  dispose() {
    this.detach();
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
  }
}

// Super simple export
export default SimpleTypeWriter;
