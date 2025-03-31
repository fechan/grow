import { Dispatch } from "react";
import { Socket } from "socket.io-client";
import { CreateLobbyMessage } from '../../types/wsClientMessages';
import { GameStateChangedMessage, LobbyInfo, LobbyInfoChangedMessage, LobbyJoinedMessage } from '../../types/wsServerMessages';
import { GameState, PartialGameState } from "../../types/game";


export function wsListen(
  socket: Socket,
  setIsConnected: Dispatch<boolean>,
  setMenu: Dispatch<string | null>,
  setLobbyInfo: Dispatch<LobbyInfo>,
  gameState: GameState,
  setGameState: Dispatch<GameState>,
) {
  const eventHandlers = {
    'connect': () => setIsConnected(true),
    'disconnect': () => setIsConnected(false),
    'lobbyJoined': (params: LobbyJoinedMessage) => {
      setLobbyInfo(params.lobbyInfo);
      setMenu('lobby');
    },
    'lobbyInfoChanged': (params: LobbyInfoChangedMessage) => {
      setLobbyInfo(params.lobbyInfo);
    },
    'gameStateChanged': (params: GameStateChangedMessage) => {
      if ('board' in params.gameState) {
        setMenu(null);
        setGameState(params.gameState as GameState);
      } else if ('boardChanges' in params.gameState) {
        const partialState = params.gameState as PartialGameState;
        const newState = {...gameState};
        for (let changedStack of partialState.boardChanges) {
          newState.board[changedStack.x][changedStack.y] = changedStack;
        }
        setGameState(newState);
      }
    }
  } as {[eventName: string]: (...args: any[]) => void};

  for (let [eventName, handler] of Object.entries(eventHandlers)) {
    socket.on(eventName, handler);
  }

  return () => {
    for (let [eventName, handler] of Object.entries(eventHandlers)) {
      socket.off(eventName, handler);
    }
  };
}

export function createLobby(socket: Socket, hostPlayerName: string) {
  socket.emit("createLobby", { hostPlayerName } as CreateLobbyMessage);
}

export function startGame(socket: Socket) {
  socket.emit("startGame");
}