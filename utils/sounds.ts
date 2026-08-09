// Sound effects using Web Audio API
// "The internet is too quiet" - Pablo's Design Philosophy
//
// Ported from stargram's musical SoundEngine (the twins trade: stargram
// knows how to perform). Same public surface asciifier always had —
// click/hover/success/error/copy/toggle/slide/drop/resume — but every
// blip now rolls off a sparkle scale through a lowpass filter with
// humanized detune, instead of fixed-frequency beeps.

type ToneOptions = {
  frequency?: number;
  duration?: number;
  delay?: number;
  gain?: number;
  type?: OscillatorType;
  detune?: number;
  bend?: number;
};

type WebkitAudioGlobal = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private lastHoverAt = 0;

  private readonly sparkleScale = [
    392.00,
    440.00,
    523.25,
    587.33,
    659.25,
    783.99,
    880.00,
    1046.50,
    1174.66,
    1318.51,
  ];

  init() {
    // No-op — initialization happens lazily on first sound.
    // Kept for backwards compatibility with existing call sites.
  }

  resume() {
    this.ensureAudioContext();
  }

  private ensureAudioContext() {
    if (this.initialized && this.audioContext) {
      // Resume if suspended (required by browser autoplay policies)
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const AudioContextConstructor = globalThis.AudioContext ??
          (globalThis as WebkitAudioGlobal).webkitAudioContext;

        if (!AudioContextConstructor) return;

        this.audioContext = new AudioContextConstructor();
        this.initialized = true;
      } catch (e) {
        console.warn("Failed to initialize AudioContext:", e);
      }
    }
  }

  private randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  private canPlayHover(minDelay = 120) {
    const now = typeof performance !== "undefined"
      ? performance.now()
      : Date.now();

    if (now - this.lastHoverAt < minDelay) return false;

    this.lastHoverAt = now;
    return true;
  }

  private pickNote(offset = 0) {
    const index = Math.floor(Math.random() * this.sparkleScale.length);
    return this.sparkleScale[
      (index + offset + this.sparkleScale.length) % this.sparkleScale.length
    ];
  }

  private playBlip({
    frequency = this.pickNote(),
    duration = 0.07,
    delay = 0,
    gain = 0.035,
    type = "sine",
    detune = 0,
    bend = 1,
  }: ToneOptions = {}) {
    this.ensureAudioContext();
    if (!this.audioContext) return;

    const startAt = this.audioContext.currentTime + delay;
    const stopAt = startAt + duration + 0.045;
    const attack = Math.min(0.014, duration * 0.35);
    const releaseAt = startAt + Math.max(attack + 0.012, duration * 0.58);
    const safeGain = Math.max(0.0001, gain);

    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency + this.randomBetween(-8, 8),
      startAt,
    );
    if (bend !== 1) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(30, frequency * bend + this.randomBetween(-5, 5)),
        startAt + duration,
      );
    }
    oscillator.detune.setValueAtTime(
      detune + this.randomBetween(-7, 7),
      startAt,
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(this.randomBetween(1700, 3200), startAt);
    filter.Q.setValueAtTime(0.4, startAt);

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(safeGain, startAt + attack);
    gainNode.gain.setTargetAtTime(
      0.0001,
      releaseAt,
      Math.max(0.018, duration * 0.18),
    );

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };

    oscillator.start(startAt);
    oscillator.stop(stopAt);
  }

  private playPattern(notes: ToneOptions[]) {
    notes.forEach((note) => this.playBlip(note));
  }

  // Sound effects library
  click() {
    const base = this.pickNote();
    this.playPattern([
      { frequency: base, duration: 0.045, gain: 0.028, type: "triangle" },
      {
        frequency: base * 1.5,
        duration: 0.045,
        delay: 0.035,
        gain: 0.018,
      },
    ]);
  }

  hover() {
    if (!this.canPlayHover()) return;

    this.playBlip({
      frequency: this.pickNote(2),
      duration: 0.032,
      gain: 0.014,
      type: "sine",
      bend: 1.04,
    });
  }

  drop() {
    const base = this.pickNote(-1);
    this.playPattern([
      {
        frequency: base,
        duration: 0.08,
        gain: 0.03,
        type: "triangle",
        bend: 0.85,
      },
      {
        frequency: base * 0.75,
        duration: 0.12,
        delay: 0.07,
        gain: 0.024,
        bend: 0.9,
      },
      {
        frequency: base * 0.5,
        duration: 0.15,
        delay: 0.14,
        gain: 0.018,
        bend: 0.92,
      },
    ]);
  }

  success() {
    const base = this.pickNote(-1);
    this.playPattern([
      {
        frequency: base,
        duration: 0.07,
        gain: 0.034,
        type: "triangle",
        bend: 1.03,
      },
      {
        frequency: base * 1.25,
        duration: 0.08,
        delay: 0.07,
        gain: 0.027,
        bend: 1.06,
      },
      {
        frequency: base * 1.5,
        duration: 0.13,
        delay: 0.14,
        gain: 0.02,
        bend: 1.08,
      },
    ]);
  }

  copy() {
    const base = this.pickNote(1);
    this.playPattern([
      { frequency: base, duration: 0.05, gain: 0.028, type: "triangle" },
      {
        frequency: base * 1.5,
        duration: 0.09,
        delay: 0.05,
        gain: 0.022,
        bend: 1.06,
      },
    ]);
  }

  toggle() {
    const base = this.pickNote();
    this.playPattern([
      { frequency: base * 1.25, duration: 0.045, gain: 0.025 },
      {
        frequency: base,
        duration: 0.06,
        delay: 0.045,
        gain: 0.021,
        type: "triangle",
      },
    ]);
  }

  slide(value: number) {
    // Map slider position to pitch, same contract as the old engine
    this.playBlip({
      frequency: 200 + value * 3,
      duration: 0.025,
      gain: 0.012,
      type: "sine",
    });
  }

  error() {
    const base = 330 + this.randomBetween(-18, 18);
    this.playPattern([
      {
        frequency: base,
        duration: 0.12,
        gain: 0.026,
        type: "sawtooth",
      },
      {
        frequency: base * 0.68,
        duration: 0.18,
        delay: 0.09,
        gain: 0.021,
        type: "triangle",
      },
    ]);
  }

  transmissionTick(char = "") {
    const isLineBreak = char === "\n";
    const isPunctuation = /[.!?]/.test(char);

    if (!isLineBreak && !isPunctuation && Math.random() > 0.035) return;
    if (!char.trim() && !isLineBreak) return;

    this.playBlip({
      frequency: this.pickNote(isPunctuation ? 4 : 2),
      duration: isPunctuation ? 0.065 : 0.028,
      gain: isPunctuation ? 0.016 : 0.008,
      type: "sine",
      bend: isLineBreak ? 0.9 : 1.1,
    });
  }

  transmissionComplete() {
    const base = this.pickNote(1);
    this.playPattern([
      { frequency: base * 0.75, duration: 0.06, gain: 0.015 },
      { frequency: base, duration: 0.08, delay: 0.065, gain: 0.017 },
      {
        frequency: base * 1.5,
        duration: 0.16,
        delay: 0.145,
        gain: 0.014,
        bend: 1.06,
      },
    ]);
  }
}

// Singleton instance
export const sounds = new SoundEngine();
