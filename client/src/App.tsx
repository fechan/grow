import { useEffect, useState } from 'react'
import './App.css'
import { Board, GameState } from '../../types/game'

// I'm ignoring type warnings for socket.io for now.
// I wrote all the server without typescript a while ago and I'm writing the
// client with TS, and to use types I need to write declarations for all the
// socket.io messages. I just want to bang out something that works now, so I'm
// leaving that for later. (https://socket.io/docs/v4/typescript/)
// @ts-ignore
import { socket } from './socket';
import { BoardDisplay } from './components/BoardDisplay';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [ playerName, setPlayername ] = useState('Player');
  const [ gameState, setGameState ] = useState({
    board: [[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,{"player":"Player","heads":1,"movable":0,"x":4,"y":1},null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,{"player":"Player","heads":1,"movable":1,"x":6,"y":3},null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]],
    players: ["Player", "b"],
    currentPlayer: "Player",
    playerHasPlaced: true,
    gameIsOver: true,
    scores: {}
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
    <>
      <BoardDisplay
        board={ gameState.board }
        players={ gameState.players }
        currentPlayer={ gameState.currentPlayer }
        isCurrentPlayersTurn={ isCurrentPlayersTurn }
      />
    </>
  )
}

export default App
