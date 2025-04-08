import { Board, Coordinate } from '../../types/game'

/**
 * Object representing possible movement targets for a selected stone, for both
 * the normal movement rule and for the highway rule
 */
interface TargetStones {
  /**
   * Map from coordinate strings `x,y` to bool of whether it is a valid target
   */
  possibleHighwayTargets: {[key: string]: boolean},

  /**
   * Array of Coordinates for adjacent empty spaces
   * where you can grow into and score points
   */
  possibleGrowthTargets: Coordinate[],
}

/**
 * Get possible target stones for the given source stone that is being moved
 * @param sourceX X coordinate of stone being moved
 * @param sourceY Y coordinate of stone being moved
 * @param board Board state
 * @param myName Name of client's player
 */
export declare function getTargetStones(
  sourceX: number,
  sourceY: number,
  board: Board,
  myName: string,
): TargetStones;