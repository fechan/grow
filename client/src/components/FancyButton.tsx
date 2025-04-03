import { useContext } from "react";
import { SoundContext } from "../sfx";

export function FancyButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sounds = useContext(SoundContext);

  return (
    <button
      {...props}
      className={ "btn " + props.className }
      onMouseDown={ () => sounds?.playBtnDown() }
      onMouseUp={ () => sounds?.playBtnUp() }
    >
      { props.children }
    </button>
  );
}