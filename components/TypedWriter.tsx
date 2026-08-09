// deno-lint-ignore-file react-no-danger

// ===================================================================
// TYPED WRITER - Uses typed.js library with keyboard sounds
// ===================================================================
// Ported from stargram (the twins trade: stargram knows how to
// perform). Types content character by character with mechanical
// keyboard sounds and optional human rhythm.

import { useEffect, useRef } from "preact/hooks";
import Typed from "typed.js";
import { SimpleTypeWriter } from "../utils/simple-typewriter.js";
import { sounds } from "../utils/sounds.ts";

interface TypedWriterProps {
  /** Plain text to type */
  text: string;
  /** HTML content to type (takes priority) */
  htmlText?: string;
  /** Speed in ms per character */
  speed?: number;
  /** Enable typing animation */
  enabled?: boolean;
  /** Callback when complete */
  onComplete?: () => void;
  /** Whether to append blinking cursor on completion */
  showCompletionCursor?: boolean;
  /** Human typing rhythm: sentence/clause pauses + per-word hesitation.
   * Leave off for ASCII art, where pauses read as stalls. */
  humanize?: boolean;
  /** CSS class */
  className?: string;
  /** Inline styles */
  style?: string;
}

export function TypedWriter({
  text,
  htmlText,
  speed = 60,
  enabled = true,
  onComplete,
  showCompletionCursor = false,
  humanize = false,
  className = "",
  style = "",
}: TypedWriterProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<Typed | null>(null);
  const soundsRef = useRef<SimpleTypeWriter | null>(null);
  const lastContentRef = useRef<string>(""); // Track what we last typed
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Initialize keyboard sounds (quieter)
    if (!soundsRef.current) {
      soundsRef.current = new SimpleTypeWriter({
        volume: 0.08,
        enabled: true,
        pack: "cherry-mx-black",
      });
      soundsRef.current.init();
    }

    return () => {
      if (soundsRef.current) {
        soundsRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    // Don't restart if content hasn't changed
    const contentKey = `${text}|${htmlText || ""}`;
    if (lastContentRef.current === contentKey && typedRef.current) {
      return;
    }
    lastContentRef.current = contentKey;

    // Cleanup previous instance
    if (typedRef.current) {
      typedRef.current.destroy();
    }

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    if (!enabled) {
      // Show full text immediately
      elementRef.current.innerHTML = htmlText || text;
      if (onComplete) onComplete();
      return;
    }

    // Watch for DOM changes to play sounds and add natural pauses
    let lastLength = 0;
    let lastChar = "";
    const observer = new MutationObserver(() => {
      if (!elementRef.current || !typedRef.current) return;

      const currentText = elementRef.current.textContent || "";
      const newLength = currentText.length;

      // Character was added
      if (newLength > lastLength) {
        const newChar = currentText[newLength - 1] || "a";

        // Play keyboard sound
        if (soundsRef.current) {
          soundsRef.current.play({
            key: newChar,
            keyCode: newChar.charCodeAt(0),
          });
        }
        sounds.transmissionTick(newChar);

        // Human rhythm: pause at real boundaries only. The whitespace guard
        // means a boundary is confirmed by the character AFTER the mark —
        // so "..." never stutters, but a sentence end breathes. The resume
        // has to be cancellable so a destroyed instance never restarts.
        if (humanize) {
          const isWhitespace = /\s/.test(newChar);
          let pauseMs = 0;
          if (isWhitespace && /[.!?]/.test(lastChar)) {
            pauseMs = 550 + Math.random() * 250;
          } else if (isWhitespace && /[,;:—]/.test(lastChar)) {
            pauseMs = 180 + Math.random() * 120;
          }

          if (pauseMs > 0) {
            const paused = typedRef.current;
            paused.stop();
            if (pauseTimeoutRef.current) {
              clearTimeout(pauseTimeoutRef.current);
            }
            pauseTimeoutRef.current = globalThis.setTimeout(() => {
              pauseTimeoutRef.current = null;
              if (typedRef.current === paused) {
                paused.start();
              }
            }, pauseMs);
          } else {
            const typedInstance = typedRef.current as Typed & {
              typeSpeed: number;
            };
            typedInstance.typeSpeed = isWhitespace && Math.random() < 0.05
              ? speed + 90 + Math.random() * 90
              : Math.max(2, Math.round(speed * (0.7 + Math.random() * 0.5)));
          }
        }

        lastChar = newChar;
      }

      lastLength = newLength;
    });

    observer.observe(elementRef.current, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    typedRef.current = new Typed(elementRef.current, {
      strings: [htmlText || text],
      typeSpeed: speed,
      showCursor: false,
      contentType: htmlText ? "html" : "text",
      onComplete: () => {
        observer.disconnect();

        if (showCompletionCursor) {
          sounds.transmissionComplete();
        }

        // Blinking cursor lands INSIDE the last child so block-level
        // content doesn't push it onto its own row.
        if (showCompletionCursor && elementRef.current) {
          const cursor = document.createElement("span");
          cursor.className = "blinking-cursor";
          cursor.textContent = "█";
          cursor.style.cssText =
            "color: #00FF41; font-size: inherit; font-weight: 900; margin-left: 0.45ch;";
          const host = elementRef.current.lastElementChild ??
            elementRef.current;
          host.appendChild(cursor);
        }

        if (onComplete) onComplete();
      },
    });

    return () => {
      observer.disconnect();
      if (typedRef.current) {
        typedRef.current.destroy();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [text, htmlText, speed, enabled, humanize]);

  return <div ref={elementRef} className={className} style={style} />;
}
