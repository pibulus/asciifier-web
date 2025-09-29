// Sound effects using Web Audio API
// "The internet is too quiet" - Pablo's Design Philosophy

export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;

    // Initialize on first user interaction
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext();
      this.initialized = true;
    }
  }

  // Play a simple beep/boop sound
  async playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ) {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Quick fade in/out for smoothness
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.3,
      this.audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sound effects library
  click() {
    // Softer, more pleasant click
    this.playTone(400, 0.03, "sine");
    setTimeout(() => this.playTone(800, 0.02, "sine"), 10);
  }

  hover() {
    this.playTone(800, 0.03, "sine");
  }

  drop() {
    // Descending tone for drop
    this.playTone(800, 0.1, "sine");
    setTimeout(() => this.playTone(600, 0.1, "sine"), 50);
    setTimeout(() => this.playTone(400, 0.15, "sine"), 100);
  }

  success() {
    // Happy ascending tones
    this.playTone(400, 0.1, "sine");
    setTimeout(() => this.playTone(600, 0.1, "sine"), 100);
    setTimeout(() => this.playTone(800, 0.15, "sine"), 200);
  }

  copy() {
    // Quick double beep
    this.playTone(700, 0.05, "square");
    setTimeout(() => this.playTone(900, 0.05, "square"), 60);
  }

  toggle() {
    this.playTone(500, 0.04, "triangle");
  }

  slide(value: number) {
    // Map slider value to frequency
    const freq = 200 + (value * 3);
    this.playTone(freq, 0.02, "sine");
  }

  error() {
    // Sad descending tones
    this.playTone(400, 0.2, "sawtooth");
    setTimeout(() => this.playTone(200, 0.3, "sawtooth"), 100);
  }

  // Easter egg: play a little melody
  playMelody() {
    const notes = [
      { freq: 523, delay: 0 }, // C
      { freq: 587, delay: 200 }, // D
      { freq: 659, delay: 400 }, // E
      { freq: 523, delay: 600 }, // C
      { freq: 659, delay: 800 }, // E
      { freq: 784, delay: 1000 }, // G
      { freq: 784, delay: 1200 }, // G
    ];

    notes.forEach((note) => {
      setTimeout(() => this.playTone(note.freq, 0.2, "sine"), note.delay);
    });
  }
}

// Singleton instance
export const sounds = new SoundEngine();
