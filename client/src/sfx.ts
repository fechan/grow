import useSound from "use-sound";
import btnDown from "./assets/sfx/btn-down.mp3";
import btnUp from "./assets/sfx/btn-up.mp3";
import ding from "./assets/sfx/ding.ogg";
import { createContext } from "react";

export const SoundContext = createContext(null as null | {[key: string]: () => void});

export function useSounds() {
  const [ playBtnDown ] = useSound(btnDown);
  const [ playBtnUp ] = useSound(btnUp);
  const [ playDing ] = useSound(ding);
  return {
    playBtnDown,
    playBtnUp,
    playDing,
  };
}
