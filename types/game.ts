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