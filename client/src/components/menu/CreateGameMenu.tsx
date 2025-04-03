import { useState } from "react";
import { FancyButton } from "../FancyButton";

interface CreateGameMenuProps {
  onClickCreateGame: (nickname: string) => void,
  onClickBack: () => void,  
}

export function CreateGameMenu({ onClickCreateGame, onClickBack }: CreateGameMenuProps) {
  const [nickname, setNickname] = useState('');
  return (
    <div className="flex flex-col gap-3 text-center w-80">
      <h1 className="text-3xl font-bold text-center">Create game</h1>

      <div className="flex flex-col">
        <label htmlFor="nickname">Your nickname</label>
        <input
          type="text"
          name="nickname"
          className="border rounded p-1"
          value={ nickname }
          onChange={ e => setNickname(e.target.value) }
        />
      </div>
      <FancyButton
        onClick={ () => onClickCreateGame(nickname) }
        disabled={ nickname.length === 0 }
      >
        Create game
      </FancyButton>
      <FancyButton className="btn-back" onClick={ onClickBack }>Back</FancyButton>
    </div>
  );
}