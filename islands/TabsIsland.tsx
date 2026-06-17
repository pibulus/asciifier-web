import { Signal } from "@preact/signals";
import Dropzone from "./Dropzone.tsx";
import TextToAscii from "./TextToAscii.tsx";
import AsciiGallery from "./AsciiGallery.tsx";
import ArciiArcade from "./ArciiArcade.tsx";

interface TabsIslandProps {
  activeTab: Signal<string>;
}

export default function TabsIsland({ activeTab }: TabsIslandProps) {
  return (
    <div>
      {activeTab.value === "image"
        ? <Dropzone />
        : activeTab.value === "text"
        ? <TextToAscii />
        : activeTab.value === "gallery"
        ? <AsciiGallery />
        : <ArciiArcade />}
    </div>
  );
}
