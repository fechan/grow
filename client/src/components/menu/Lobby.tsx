import { LobbyInfo } from "../../../../types/wsServerMessages";
import { FancyButton } from "../FancyButton";

interface LobbyProps {
  lobbyInfo: LobbyInfo,
  currentPlayer: string,
  onClickStartGame: () => void,
  onClickBack: () => void,  
}

export function Lobby({ lobbyInfo, currentPlayer, onClickStartGame, onClickBack }: LobbyProps) {
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
      { currentPlayer === lobbyInfo.host &&
        <FancyButton onClick={ onClickStartGame }>Start game</FancyButton>
      }
      <FancyButton onClick={ onClickBack }>Quit to main menu</FancyButton>
    </div>
  );
}