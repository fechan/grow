import { useState } from "react";
import { FancyButton } from "../FancyButton";

interface CreateGameMenuProps {
  onClickCreateGame: (nickname: string) => void,
  onClickBack: () => void,  
}

export function CreateGameMenu({ onClickCreateGame, onClickBack }: CreateGameMenuProps) {
  const [nickname, setNickname] = useState('');
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1>Create game</h1>
      <div className="flex flex-col">
        <label htmlFor="nickname">Your nickname</label>
        <input
          type="text"
          name="nickname"
          className="border rounded"
          value={ nickname }
          onChange={ e => setNickname(e.target.value) }
        />
      </div>
      <FancyButton onClick={ () => onClickCreateGame(nickname) }>Create game</FancyButton>
      <FancyButton onClick={ onClickBack }>Back</FancyButton>
    </div>
  );
}