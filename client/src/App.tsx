import { useEffect, useState } from 'react'
import './App.css'
import { GameState } from '../../types/game'

// I'm ignoring type warnings for socket.io for now.
// I wrote all the server without typescript a while ago and I'm writing the
// client with TS, and to use types I need to write declarations for all the
// socket.io messages. I just want to bang out something that works now, so I'm
// leaving that for later. (https://socket.io/docs/v4/typescript/)
// @ts-ignore
import { socket } from './socket';
import { BoardDisplay } from './components/BoardDisplay';
import { Scoreboard } from './components/Scoreboard';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

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

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
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
            onMoveStone={ (toX, toY, fromX, fromY) => console.log(`Moving from ${fromX} ${fromY} to ${toX} ${toY}`) }
            onPlaceStone={ (x, y) => console.log(`Placing at ${x} ${y}`) }
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
  )
}

export default App
