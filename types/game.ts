export interface Coordinate {
  x: number,
  y: number,
}

/**
 * A stone stack on the board that can have one or more stones
 */
export interface StoneStack {
  player: string,
  heads: number,
  movable: number,
  x: number,
  y: number,
};

/**
 * The board on which Grow is played on.
 * A space can be accessed with `board[x][y]`.
 */
export type Board = (StoneStack | null)[][];

/**
 * Map from player name to score
 */
export type Scores = {[key: string]: number};

/**
 * State of the Grow game at any point in time
 */
export interface GameState {
  board: Board,
  players: string[],
  currentPlayer: string,
  playerHasPlaced: boolean,
  gameIsOver: boolean,
  scores: Scores,
}