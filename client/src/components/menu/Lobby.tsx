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
    <div className="flex flex-col gap-3 text-center w-80">
      <h1 className="text-3xl font-bold text-center">Lobby</h1>

      <section>
        <ul>
          {
            lobbyInfo.players.map(player => (
              <li key={ player }>
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
      </section>

      <section>
        <small className="text-stone-400">Share this lobby code with your enemies</small>
        <div
          onClick={ () => navigator.clipboard.writeText(lobbyInfo.lobbyCode) }
          className="rounded text-3xl border rounded border-dashed border-2 border-stone-500 p-3 hover:bg-white/10 active:bg-white/20"
        >
          { lobbyInfo.lobbyCode }
          <span className="text-xs select-none">✂️</span>
        </div>
      </section>

      { currentPlayer === lobbyInfo.host &&
        <FancyButton onClick={ onClickStartGame }>Start game</FancyButton>
      }
      <FancyButton className="btn-back" onClick={ onClickBack }>Quit to main menu</FancyButton>
    </div>
  );
}