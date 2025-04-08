import { Dispatch } from "react";
import { Socket } from "socket.io-client";
import { CreateLobbyMessage, JoinLobbyMessage, PlayMoveMessage } from '../../types/wsClientMessages';
import { GameStateChangedMessage, LobbyInfo, LobbyInfoChangedMessage, LobbyJoinedMessage } from '../../types/wsServerMessages';
import { GameState, MoveName, PartialGameState } from "../../types/game";


export function wsListen(
  socket: Socket,
  setIsConnected: Dispatch<boolean>,
  setMenu: Dispatch<string | null>,
  setLobbyInfo: Dispatch<LobbyInfo>,
  gameState: GameState,
  setGameState: Dispatch<GameState>,
  playerName: string,
  sounds: any,
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
      // do sounds
      const currentPlayerChanged = gameState.currentPlayer !== params.gameState.currentPlayer;
      if (currentPlayerChanged) {
        if (params.gameState.currentPlayer === playerName) {
          sounds.playDing();
        }
      } else {
        sounds.playBtnUp();
      }

      // update board
      if ('board' in params.gameState) {
        setMenu(null);
        setGameState(params.gameState as GameState);
      } else if ('boardChanges' in params.gameState) {
        const partialState = params.gameState as PartialGameState;
        const newBoard = gameState.board;
        for (let changedStack of partialState.boardChanges) {
          newBoard[changedStack.x][changedStack.y] = changedStack;
        }
        setGameState({ ...partialState, board: newBoard });
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

export function joinLobby(socket: Socket, lobby: string, playerName: string) {
  socket.emit("joinLobby", {
    lobby: lobby,
    playerName: playerName,
  } as JoinLobbyMessage);
}

export function startGame(socket: Socket) {
  socket.emit("startGame");
}

export function leave(socket: Socket) {
  socket.emit("leave");
}

export function playMove(
  socket: Socket,
  type: MoveName,
  targetX?: number,
  targetY?: number,
  fromX?: number,
  fromY?: number
) {
  socket.emit("playMove", {
    type: type,
    target_x: targetX,
    target_y: targetY,
    from_x: fromX,
    from_y: fromY,
  } as PlayMoveMessage)
}