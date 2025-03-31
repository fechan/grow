import { useEffect, useState } from 'react';
import { GameState } from '../../types/game';
import './App.css';

// I'm ignoring type warnings for socket.io for now.
// I wrote all the server without typescript a while ago and I'm writing the
// client with TS, and to use types I need to write declarations for all the
// socket.io messages. I just want to bang out something that works now, so I'm
// leaving that for later. (https://socket.io/docs/v4/typescript/)
// @ts-ignore
import { LobbyInfo } from '../../types/wsServerMessages';
import { BoardDisplay } from './components/BoardDisplay';
import { CreateGameMenu, JoinGameMenu, Lobby, MainMenu } from './components/Menu';
import { Modal } from './components/Modal';
import { Scoreboard } from './components/Scoreboard';
import { socket } from './socket';
import { createLobby, playMove, startGame, startLobby, wsListen } from './socketController';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [ lobbyInfo, setLobbyInfo ] = useState(null as LobbyInfo | null);
  const [ playerName, setPlayerName ] = useState('Player');
  const [ gameState, setGameState ] = useState({
    board: [[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,{"player":"Player","heads":1,"movable":0,"x":4,"y":1},{"player":"Player","heads":1,"movable":0,"x":4,"y":2},null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,{"player":"Player","heads":1,"movable":1,"x":6,"y":3},null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]],
    players: ["Player", "b"],
    currentPlayer: "Player",
    playerHasPlaced: true,
    gameIsOver: true,
    scores: {"Player": 5, "b": 10}
  } as GameState);
  const isCurrentPlayersTurn = playerName === gameState.currentPlayer;

  const [ menu, setMenu ] = useState('main' as string | null);
  const menus = {
    'main': <MainMenu
      onClickCreateGame={ () => setMenu('create') }
    />,
    'create': <CreateGameMenu
      onClickCreateGame={ () => createLobby(socket, playerName) }
    />,
    'join': <JoinGameMenu />,
    'lobby': <Lobby
      lobbyInfo={ lobbyInfo! }
      currentPlayer={ playerName }
      onClickStartGame={ () => startGame(socket) }
    />,
  };
  const menuElement = menu ? menus[menu] : undefined;

  useEffect(() => wsListen(
    socket,
    setIsConnected,
    setMenu,
    setLobbyInfo,
    gameState,
    setGameState
  ), [socket, setIsConnected, setMenu, setLobbyInfo, gameState, setGameState]);

  return (
    <>
      { menu &&
        <Modal>
          { menuElement }
        </Modal>
      }
      <div className="flex items-center justify-center h-full flex-col bg-stone-800 text-white">
        <header>
          <h1 className="text-4xl font-bold">The Game of Grow</h1>
        </header>
        <div className="flex gap-5">
          <main>
            <BoardDisplay
              board={ gameState.board }
              players={ gameState.players }
              currentPlayer={ gameState.currentPlayer }
              isCurrentPlayersTurn={ isCurrentPlayersTurn }
              playerHasPlaced={ gameState.playerHasPlaced }
              onMoveStone={ (toX, toY, fromX, fromY) => playMove(socket, 'place', toX, toY, fromX, fromY) }
              onPlaceStone={ (x, y) => playMove(socket, 'place', x, y) }
            />
          </main>
          <aside className='flex flex-col gap-3'>
            <Scoreboard
              players={ gameState.players }
              currentPlayer={ gameState.currentPlayer }
              scores={ gameState.scores }
            />
          </aside>
        </div>
      </div>
    </>
  )
}

export default App
