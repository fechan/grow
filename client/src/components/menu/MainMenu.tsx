import { FancyButton } from "../FancyButton";

interface MainMenuProps {
  onClickJoinGame: () => void,
  onClickCreateGame: () => void,
  onClickHowToPlay: () => void,
}

export function MainMenu({ onClickJoinGame, onClickCreateGame, onClickHowToPlay }: MainMenuProps) {
  return (
    <div className="flex flex-col gap-3">
      <FancyButton onClick={ onClickJoinGame }>Join game</FancyButton>
      <FancyButton onClick={ onClickCreateGame }>Create game</FancyButton>
      <FancyButton onClick={ onClickHowToPlay }>How to play</FancyButton>
    </div>
  );
}
