import { FancyButton } from "../FancyButton";

interface MainMenuProps {
  onClickJoinGame: () => void,
  onClickCreateGame: () => void,
  onClickHowToPlay: () => void,
}

export function MainMenu({ onClickJoinGame, onClickCreateGame, onClickHowToPlay }: MainMenuProps) {
  return (
    <div className="flex flex-col gap-3 w-80 text-center">
      <h1 className="text-3xl font-bold">Main Menu</h1>
      <FancyButton onClick={ onClickJoinGame }>Join game</FancyButton>
      <FancyButton onClick={ onClickCreateGame }>Create game</FancyButton>
      <FancyButton onClick={ onClickHowToPlay }>How to play</FancyButton>
      <small>
        <p>Grow was invented and programmed by <a href="https://fredchan.org" className="text-green-400 hover:text-green-300 hover:underline">Frederick Chan</a></p>
        <p>The source code is available on <a className="text-green-400 hover:text-green-300 hover:underline" href="https://github.com/fechan/grow-app">Github</a>.</p>
      </small>
    </div>
  );
}
