import { useEffect, useState } from 'react';
import { GameState } from '../../types/game';
import './App.css';

// I'm ignoring type warnings for socket.io for now.
// I wrote all the server without typescript a while ago and I'm writing the
// client with TS, and to use types I need to write declarations for all the
// socket.io messages. I just want to bang out something that works now, so I'm
// leaving that for later. (https://socket.io/docs/v4/typescript/)
// @ts-ignore
import { socket } from './socket';

import { LobbyInfo } from '../../types/wsServerMessages';
import { BoardDisplay } from './components/BoardDisplay';
import { MainMenu } from './components/menu/MainMenu';
import { CreateGameMenu } from './components/menu/CreateGameMenu';
import { JoinGameMenu } from './components/menu/JoinGameMenu';
import { Lobby } from './components/menu/Lobby';
import { HowToPlay } from './components/menu/HowToPlay';
import { Modal } from './components/Modal';
import { Scoreboard } from './components/Scoreboard';
import { createLobby, joinLobby, playMove, startGame, wsListen } from './socketController';
import { EndTurnButton } from './components/EndTurnButton';
import { SoundContext, useSounds } from './sfx';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const sounds = useSounds();

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

  const [ menu, setMenu ] = useState('main' as keyof typeof menus | null);
  const menus = {
    'main': <MainMenu
      onClickCreateGame={ () => setMenu('create') }
      onClickJoinGame={ () => setMenu('join') }
      onClickHowToPlay={ () => setMenu('howToPlay') }
    />,
    'create': <CreateGameMenu
      onClickCreateGame={ (playerName) => {
        createLobby(socket, playerName);
        setPlayerName(playerName);
      } }
      onClickBack={ () => setMenu('main') }
    />,
    'join': <JoinGameMenu
      onClickJoinGame={ (lobby, playerName) => {
        joinLobby(socket, lobby, playerName);
        setPlayerName(playerName);
      } }
      onClickBack={ () => setMenu('main') }
    />,
    'lobby': <Lobby
      lobbyInfo={ lobbyInfo! }
      currentPlayer={ playerName }
      onClickStartGame={ () => startGame(socket) }
      onClickBack={ () => setMenu('main') }
    />,
    'howToPlay': <HowToPlay
      onClickBack={ () => setMenu('main') }
    />
  };
  const menuElement = menu ? menus[menu] : undefined;

  useEffect(() => wsListen(
    socket,
    setIsConnected,
    setMenu,
    setLobbyInfo,
    gameState,
    setGameState,
    playerName,
    sounds
  ),
  [
    socket,
    setIsConnected,
    setMenu,
    setLobbyInfo,
    gameState,
    setGameState,
    playerName,
    sounds
  ]);

  return (
    <>
      <SoundContext.Provider value={ sounds }>
        { menu &&
          <Modal>
            { menuElement }
          </Modal>
        }
        <div className="flex items-center justify-center h-full flex-col bg-stone-800 text-white">
          <header className="text-center mb-5">
            <h1 className="text-4xl font-bold">The Game of Grow</h1>
            <p>
              Created by <a href="https://fredchan.org" className="text-green-400 hover:text-green-300 hover:underline">Frederick Chan</a>
            </p>
          </header>
          <main className="flex flex-col gap-3">
            <EndTurnButton
              onEndTurn={ () => playMove(socket, 'end') }
              isCurrentPlayersTurn={ isCurrentPlayersTurn }
              playerHasPlaced={ gameState.playerHasPlaced }
            />
            <div className="flex flex-col md:flex-row gap-3">
              <BoardDisplay
                board={ gameState.board }
                players={ gameState.players }
                currentPlayer={ gameState.currentPlayer }
                isCurrentPlayersTurn={ isCurrentPlayersTurn }
                playerHasPlaced={ gameState.playerHasPlaced }
                onMoveStone={ (toX, toY, fromX, fromY) => playMove(socket, 'move', toX, toY, fromX, fromY) }
                onPlaceStone={ (x, y) => playMove(socket, 'place', x, y) }
              />
              <aside className='flex flex-col gap-3'>
                <Scoreboard
                  players={ gameState.players }
                  currentPlayer={ gameState.currentPlayer }
                  scores={ gameState.scores }
                />
              </aside>
            </div>
          </main>
        </div>
      </SoundContext.Provider>
    </>
  )
}

export default App
