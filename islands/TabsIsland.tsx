import { useSignal } from "@preact/signals";
import { sounds } from "../utils/sounds.ts";
import Dropzone from "./Dropzone.tsx";
import TextToAscii from "./TextToAscii.tsx";

export default function TabsIsland() {
  const activeTab = useSignal("image");

  const handleTabChange = (tab: string) => {
    sounds.click();
    activeTab.value = tab;
  };

  return (
    <>
      {/* Tab Navigation - Inline in header */}
      <div
        class="flex border-4 rounded-lg overflow-hidden shadow-brutal"
        style="border-color: var(--color-border, #0A0A0A)"
      >
        <button
          onClick={() => handleTabChange("image")}
          class={`px-4 py-2 font-mono font-bold text-sm transition-all duration-200 ${
            activeTab.value === "image"
              ? "shadow-brutal-inset"
              : "hover:animate-pop hover:scale-105"
          }`}
          style={activeTab.value === "image"
            ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)"
            : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A)"}
        >
          📸 IMAGE → ASCII
        </button>
        <div
          class="w-0.5"
          style="background-color: var(--color-border, #0A0A0A)"
        >
        </div>
        <button
          onClick={() => handleTabChange("text")}
          class={`px-4 py-2 font-mono font-bold text-sm transition-all duration-200 ${
            activeTab.value === "text"
              ? "shadow-brutal-inset"
              : "hover:animate-pop hover:scale-105"
          }`}
          style={activeTab.value === "text"
            ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)"
            : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A)"}
        >
          ✨ TEXT → ASCII
        </button>
      </div>

      {/* Tab Content - Full width below header */}
      <div class="max-w-6xl mx-auto px-4 py-8 w-full">
        {activeTab.value === "image" ? <Dropzone /> : <TextToAscii />}
      </div>

      <style>
        {`
        .shadow-brutal-inset {
          box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.3);
        }
      `}
      </style>
    </>
  );
}
