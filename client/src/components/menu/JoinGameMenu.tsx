import { useState } from "react";
import { FancyButton } from "../FancyButton";

interface JoinGameMenuProps {
  onClickJoinGame: (lobby: string, playerName: string) => void,
  onClickBack: () => void, 
}

export function JoinGameMenu({ onClickJoinGame, onClickBack }: JoinGameMenuProps) {
  const [ nickname, setNickname ] = useState('');
  const [ lobbyCode, setLobbyCode ] = useState('');

  return (
    <div className="flex flex-col gap-3 text-center w-80">
      <h1 className="text-3xl font-bold text-center">Join game</h1>

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

      <div className="flex flex-col">
        <label htmlFor="lobby-code">Lobby code</label>
        <input
          type="text"
          name="lobby-code"
          className="border rounded p-1"
          value={ lobbyCode }
          onChange={ e => setLobbyCode(e.target.value) }
        />
      </div>

      <FancyButton
        onClick={ () => onClickJoinGame(lobbyCode, nickname) }
        disabled={ nickname.length === 0 || lobbyCode.length === 0 }
      >
        Join game
      </FancyButton>
      <FancyButton className="btn-back" onClick={ onClickBack }>Back</FancyButton>
    </div>
  );
}
