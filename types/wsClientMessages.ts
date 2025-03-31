import { MoveName } from "./game";

export interface CreateLobbyMessage {
  hostPlayerName: string,
}

export interface JoinLobbyMessage {
  lobby: string,
  playerName: string,
}

export interface PlayMoveMessage {
  type: MoveName,
  target_x: number | undefined,
  target_y: number | undefined,
  from_x: number | undefined,
  from_y: number | undefined,
}