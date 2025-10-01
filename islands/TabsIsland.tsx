import { Signal } from "@preact/signals";
import Dropzone from "./Dropzone.tsx";
import TextToAscii from "./TextToAscii.tsx";

interface TabsIslandProps {
  activeTab: Signal<string>;
}

export default function TabsIsland({ activeTab }: TabsIslandProps) {
  return (
    <div>
      {activeTab.value === "image" ? <Dropzone /> : <TextToAscii />}
    </div>
  );
}
