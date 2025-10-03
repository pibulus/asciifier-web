import { useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";

/**
 * 🎨 Magic Dropdown Component
 *
 * Reusable dropdown with TextToAscii's signature styling:
 * - Checkmarks for selected items
 * - Hover shift animation
 * - Rotating arrow
 * - Color indication when changed
 * - Sound effects
 *
 * Built by Pablo for consistent UX 🎸
 */

interface Option {
  name: string;
  value: string;
}

interface MagicDropdownProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  changed?: boolean;
  width?: string;
}

export function MagicDropdown({
  label,
  options,
  value,
  onChange,
  changed = false,
  width = "w-full",
}: MagicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    sounds.click();
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div class="relative">
      <div
        class={`magic-select ${width} px-2 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 border-3 sm:border-4 rounded-xl sm:rounded-2xl font-mono font-bold cursor-pointer transition-all shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5`}
        style={changed
          ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
          : "background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"}
        onClick={(e) => {
          e.stopPropagation();
          sounds.click();
          setIsOpen(!isOpen);
        }}
      >
        <div class="flex items-center justify-between">
          <span class="text-xs sm:text-sm md:text-base truncate">
            <span class="opacity-60 mr-1">{label}:</span>
            {selectedOption?.name || "Select..."}
          </span>
          <span
            class="text-sm sm:text-base md:text-lg transition-transform flex-shrink-0 ml-1"
            style={`color: var(--color-accent, #FF69B4); transform: rotate(${
              isOpen ? "180" : "0"
            }deg);`}
          >
            ▼
          </span>
        </div>
      </div>
      {isOpen && (
        <div
          class="absolute z-20 w-full mt-1 border-3 sm:border-4 rounded-xl sm:rounded-2xl shadow-brutal-lg overflow-hidden dropdown-scrollbar animate-dropdown-open"
          style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: 300px; overflow-y: auto;"
        >
          {options.map((option) => (
            <div
              key={option.value}
              class="px-2 py-2 sm:px-4 sm:py-3 md:px-5 md:py-3 text-xs sm:text-sm md:text-base font-mono font-bold cursor-pointer transition-all hover:pl-4 sm:hover:pl-6 md:hover:pl-7"
              style={`background-color: ${
                value === option.value
                  ? "var(--color-accent, #FF69B4)"
                  : "transparent"
              }; color: ${
                value === option.value
                  ? "var(--color-base, #FAF9F6)"
                  : "var(--color-text, #0A0A0A)"
              };`}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => sounds.hover && sounds.hover()}
            >
              {value === option.value && <span class="mr-1 sm:mr-2">✓</span>}
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
