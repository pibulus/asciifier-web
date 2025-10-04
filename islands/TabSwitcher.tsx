import { Signal } from "@preact/signals";
import { sounds } from "../utils/sounds.ts";

interface TabSwitcherProps {
  activeTab: Signal<string>;
}

export default function TabSwitcher({ activeTab }: TabSwitcherProps) {
  const handleTabChange = (tab: string) => {
    sounds.click();
    activeTab.value = tab;
  };

  return (
    <div class="flex mt-4 sm:mt-6">
      <div
        class="flex border-3 sm:border-4 rounded-lg overflow-hidden shadow-brutal"
        style="border-color: var(--color-border, #0A0A0A)"
      >
        <button
          onClick={() => handleTabChange("image")}
          class={`px-4 py-3 sm:px-4 sm:py-3 md:px-6 md:py-3 font-mono font-bold text-sm sm:text-sm md:text-base transition-all duration-200 ${
            activeTab.value === "image"
              ? "shadow-brutal-inset"
              : "hover:scale-105 shadow-brutal-sm"
          }`}
          style={activeTab.value === "image"
            ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6);"
            : "background-color: rgba(250, 249, 246, 0.3); color: var(--color-text, #0A0A0A);"}
        >
          <span class="sm:hidden">📸 IMAGE</span>
          <span class="hidden sm:inline md:hidden">IMAGE</span>
          <span class="hidden md:inline">📸 IMAGE → ASCII</span>
        </button>
        <div
          class="w-0.5"
          style="background-color: var(--color-border, #0A0A0A)"
        >
        </div>
        <button
          onClick={() => handleTabChange("text")}
          class={`px-4 py-3 sm:px-4 sm:py-3 md:px-6 md:py-3 font-mono font-bold text-sm sm:text-sm md:text-base transition-all duration-200 ${
            activeTab.value === "text"
              ? "shadow-brutal-inset"
              : "hover:scale-105 shadow-brutal-sm"
          }`}
          style={activeTab.value === "text"
            ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6);"
            : "background-color: rgba(250, 249, 246, 0.3); color: var(--color-text, #0A0A0A);"}
        >
          <span class="sm:hidden">✨ TEXT</span>
          <span class="hidden sm:inline md:hidden">TEXT</span>
          <span class="hidden md:inline">✨ TEXT → ASCII</span>
        </button>
        <div
          class="w-0.5"
          style="background-color: var(--color-border, #0A0A0A)"
        >
        </div>
        <button
          onClick={() => handleTabChange("gallery")}
          class={`px-4 py-3 sm:px-4 sm:py-3 md:px-6 md:py-3 font-mono font-bold text-sm sm:text-sm md:text-base transition-all duration-200 ${
            activeTab.value === "gallery"
              ? "shadow-brutal-inset"
              : "hover:scale-105 shadow-brutal-sm"
          }`}
          style={activeTab.value === "gallery"
            ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6);"
            : "background-color: rgba(250, 249, 246, 0.3); color: var(--color-text, #0A0A0A);"}
        >
          <span class="sm:hidden">🎨 GALLERY</span>
          <span class="hidden sm:inline md:hidden">GALLERY</span>
          <span class="hidden md:inline">🎨 GALLERY</span>
        </button>
      </div>

      <style>
        {`
        .shadow-brutal-inset {
          box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.3);
        }
        .shadow-brutal-sm {
          box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
        }
      `}
      </style>
    </div>
  );
}
