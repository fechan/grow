import { GameState, PartialGameState } from "./game";

export interface LobbyInfo {
  lobbyCode: string,
  players: string[],
  host: PlaybackDirection,
}

export interface LobbyJoinedMessage {
  lobbyInfo: LobbyInfo,
  joinedPlayer: string,
}

export interface LobbyInfoChangedMessage {
  lobbyInfo: LobbyInfo,
}

export interface GameStateChangedMessage {
  gameState: GameState | PartialGameState,
}