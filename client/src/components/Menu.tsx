import { useState } from "react";
import { FancyButton } from "./FancyButton";
import { LobbyInfo } from "../../../types/wsServerMessages";

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

interface CreateGameMenuProps {
  onClickCreateGame: (nickname: string) => void,
}

export function CreateGameMenu({ onClickCreateGame }: CreateGameMenuProps) {
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
    </div>
  );
}

interface LobbyProps {
  lobbyInfo: LobbyInfo,
  currentPlayer: string,
  onClickStartGame: () => void,
}

export function Lobby({ lobbyInfo, currentPlayer, onClickStartGame }: LobbyProps) {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1>Lobby</h1>
      <p>Lobby code: { lobbyInfo.lobbyCode }</p>
      <ul>
        {
          lobbyInfo.players.map(player => (
            <li>
              { player }

              { player === currentPlayer &&
                <span className="rounded bg-blue-600 px-1 ms-1 uppercase text-xs">
                  you
                </span>
              }

              { player === lobbyInfo.host &&
                <span className="rounded bg-yellow-300 px-1 ms-1 uppercase text-xs text-slate-800">
                  host
                </span>
              }
            </li>
          ))
        }
      </ul>
      <FancyButton onClick={ onClickStartGame }>Start game</FancyButton>
    </div>
  );
}

export function JoinGameMenu() {
  return (
    <></>
  );
}