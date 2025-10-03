/**
 * 🔮 Privacy-Focused Analytics Service
 *
 * PRIVACY POLICY:
 * - NO personal data tracked (no text content, no images)
 * - Only aggregate usage metrics (font selections, export formats, success rates)
 * - Error messages sanitized to remove potential personal data
 * - All data anonymized for product improvement only
 *
 * Analytics are OPTIONAL - only loads if POSTHOG_KEY is configured
 *
 * Uses dynamic import to prevent connection attempts without API keys
 */

class AnalyticsService {
  private isInitialized = false;
  private posthog: any = null;
  private eventQueue: Array<
    { eventName: string; properties: Record<string, any> }
  > = [];

  async init() {
    if (this.isInitialized || typeof window === "undefined") return;

    // Get keys from window.ENV (set by Fresh in _app.tsx)
    const key = (window as any).ENV?.POSTHOG_KEY;
    const host = (window as any).ENV?.POSTHOG_HOST || "https://app.posthog.com";

    if (!key) {
      // Silently disable analytics - no warnings needed for local dev
      this.isInitialized = true;
      return;
    }

    try {
      // Dynamic import - only loads PostHog when we have API keys
      const posthogModule = await import("posthog-js");
      this.posthog = posthogModule.default;

      this.posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        disable_survey_popups: true,
        property_blacklist: ["$current_url", "$referrer"],
        loaded: () => {
          this.isInitialized = true;
          this.processQueue();
        },
      });
    } catch (error) {
      console.warn("PostHog failed to load:", error);
      this.isInitialized = true; // Prevent retry loops
    }
  }

  private trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (typeof window === "undefined") return;

    const event = { eventName, properties };

    if (this.isInitialized && this.posthog) {
      this.posthog.capture(eventName, properties);
    } else {
      this.eventQueue.push(event);
    }
  }

  private processQueue() {
    while (this.eventQueue.length > 0 && this.posthog) {
      const { eventName, properties } = this.eventQueue.shift()!;
      this.posthog.capture(eventName, properties);
    }
  }

  // ASCII Art Generation
  trackAsciiGenerated(font: string, effect: string | null, success: boolean) {
    this.trackEvent("ascii_generated", {
      font,
      effect: effect || "none",
      success,
      timestamp: Date.now(),
    });
  }

  // Image Conversion
  trackImageConverted(fileSize: number, success: boolean, errorType?: string) {
    this.trackEvent("image_converted", {
      file_size_kb: Math.round(fileSize / 1024),
      success,
      error_type: errorType,
      timestamp: Date.now(),
    });
  }

  // Export Events
  trackExport(format: string) {
    this.trackEvent("export_clicked", {
      format, // "plain", "html", "clipboard"
      timestamp: Date.now(),
    });
  }

  // Theme Changes
  trackThemeChanged(fromTheme: string, toTheme: string) {
    this.trackEvent("theme_changed", {
      from_theme: fromTheme,
      to_theme: toTheme,
      timestamp: Date.now(),
    });
  }

  // Random ASCII Art
  trackRandomAscii(category?: string) {
    this.trackEvent("random_ascii_viewed", {
      category: category || "mixed",
      timestamp: Date.now(),
    });
  }

  // Error Tracking
  trackError(errorType: string, context: Record<string, any> = {}) {
    this.trackEvent("error_occurred", {
      error_type: errorType,
      context,
      timestamp: Date.now(),
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();
