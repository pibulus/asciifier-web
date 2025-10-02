import { useEffect } from "preact/hooks";
import { checkWelcomeStatus } from "./WelcomeModal.tsx";

/**
 * 🔍 Welcome Checker Island
 *
 * Checks on mount if user has seen welcome modal.
 * If not, shows it automatically.
 */

export default function WelcomeChecker() {
  useEffect(() => {
    // Check welcome status on mount (client-side only)
    checkWelcomeStatus();
  }, []);

  // This component doesn't render anything
  return null;
}
