// ===================================================================
// TOAST NOTIFICATION - Better than alert()
// ===================================================================

import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "error", duration = 4000, onClose }: ToastProps) {
  const isVisible = useSignal(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      isVisible.value = false;
      if (onClose) setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible.value) return null;

  const bgColor = type === "error"
    ? "var(--color-error, #FF4444)"
    : type === "success"
    ? "var(--color-success, #4ADE80)"
    : "var(--color-accent, #FF69B4)";

  return (
    <div
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-toast-in"
      style={{ maxWidth: "90%", width: "500px" }}
    >
      <div
        class="px-6 py-4 border-4 rounded-2xl shadow-brutal font-mono font-bold text-center"
        style={`background-color: ${bgColor}; border-color: var(--color-border, #0A0A0A); color: var(--color-base, #FAF9F6);`}
      >
        <div class="flex items-center justify-between gap-4">
          <span class="flex-1 text-sm sm:text-base">{message}</span>
          <button
            onClick={() => {
              isVisible.value = false;
              if (onClose) setTimeout(onClose, 300);
            }}
            class="text-lg hover:scale-110 transition-transform"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>

      <style>
        {`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-toast-in {
          animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .shadow-brutal {
          box-shadow: 4px 4px 0 var(--color-border, #0A0A0A);
        }
        `}
      </style>
    </div>
  );
}

// Toast Manager Component
interface ToastMessage {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

export const toastMessages = signal<ToastMessage[]>([]);

export function ToastContainer() {
  return (
    <>
      {toastMessages.value.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {
            toastMessages.value = toastMessages.value.filter((t) => t.id !== toast.id);
          }}
        />
      ))}
    </>
  );
}

// Helper function to show toasts
let toastIdCounter = 0;

export function showToast(message: string, type: "error" | "success" | "info" = "error") {
  const id = ++toastIdCounter;
  toastMessages.value = [...toastMessages.value, { id, message, type }];
}
