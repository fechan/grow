import { useState } from 'react';
import { Board, Coordinate } from '../../../types/game';
import { getTargetStones } from '../possibleTargets';
import { GhostStone, GrowthTarget, StoneStackDisplay } from './StoneStackDisplay';

export const sizes = {
  pitch: 50,
  padding: 50,
  stoneRadius: 50 / 2 - 2,
};

function getBoardSpace(mouseX: number, mouseY: number) {
  return {
    x: Math.round((mouseX - sizes.padding) / sizes.pitch),
    y: Math.round((mouseY - sizes.padding) / sizes.pitch),
  } as Coordinate;
}

interface BoardDisplayProps {
  board: Board,
  players: string[],
  currentPlayer: string,
  isCurrentPlayersTurn: boolean,
  playerHasPlaced: boolean,
  onMoveStone: (targetX: number, targetY: number, fromX: number, fromY: number) => void,
  onPlaceStone: (targetX: number, targetY: number) => void,
}

export function BoardDisplay({
  board,
  players,
  currentPlayer,
  isCurrentPlayersTurn,
  playerHasPlaced,
  onMoveStone,
  onPlaceStone
}: BoardDisplayProps) {
  const [ hoveredSpace, setHoveredSpace ] = useState(null as Coordinate | null);
  const [ selectedSpace, setSelectedSpace ] = useState(null as Coordinate | null);

  const boardHeight = board[0].length;
  const boardWidth = board.length;

  const showGhostStone = (
    isCurrentPlayersTurn &&
    hoveredSpace &&
    !selectedSpace &&
    !playerHasPlaced &&
    hoveredSpace.x !== null && hoveredSpace.y !== null && // a space is being hovered?
    hoveredSpace.x in board && // in bounds of board width?
    hoveredSpace.y in board[hoveredSpace.x] && // in bounds of board height?
    board[hoveredSpace.x][hoveredSpace.y] === null // hovered space is empty?
  );

  const possibleTargets = selectedSpace && getTargetStones(selectedSpace.x, selectedSpace.y, board, currentPlayer);

  function onMouseMove(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    const newHoveredSpace = getBoardSpace(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    if (hoveredSpace === null || newHoveredSpace.x !== hoveredSpace.x || newHoveredSpace.y !== hoveredSpace.y) {
      setHoveredSpace(newHoveredSpace);
    }
  }

  function onClick(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (selectedSpace) {
      setSelectedSpace(null);
    }
  }

  return (
    <>
      <p>Placed? { playerHasPlaced.toString() }</p>
      <svg
        width="800"
        height="800"
        style={{
          backgroundColor: '#e0bb6c',
        }}
        onMouseMove={ onMouseMove }
        onClick={ onClick }
      >
        {
          [...Array(boardHeight)].map((_, i) =>
            <line
              key={ 'board-vline-' + i }
              x1={ i * sizes.pitch + sizes.padding }
              y1={ sizes.padding }
              x2={ i * sizes.pitch + sizes.padding }
              y2={ boardHeight * sizes.pitch }
              style={{
                stroke: "black",
                strokeWidth: 2,
              }}
            />)
        }
        {
          [...Array(boardWidth)].map((_, i) =>
            <line
              key={ 'board-hline-' + i }
              x1={ sizes.padding }
              y1={ i * sizes.pitch + sizes.padding }
              x2={ boardWidth * sizes.pitch }
              y2={ i * sizes.pitch + sizes.padding }
              style={{
                stroke: "black",
                strokeWidth: 2,
              }}
            />)
        }
        {
          board.flat().map(stack => stack &&
            <StoneStackDisplay
              key={ `stone-stack-${stack.x}-${stack.y}` }
              stack={ stack }
              players={ players }
              ghost={ false }
              isSelected={ Boolean(selectedSpace) && selectedSpace?.x === stack.x && selectedSpace?.y === stack.y }
              isPossibleTarget={ possibleTargets === null ? false : `${stack.x},${stack.y}` in possibleTargets!.possibleHighwayTargets}
              onSelect={ () => setSelectedSpace({x: stack.x, y: stack.y}) }
              onDeselect={ () => setSelectedSpace(null) }
              onTarget={ () => onMoveStone(stack.x, stack.y, selectedSpace!.x, selectedSpace!.y) }
            />
          )
        }
        { showGhostStone &&
          <GhostStone
            x={ hoveredSpace.x! }
            y={ hoveredSpace.y! }
            currentPlayer={ currentPlayer }
            players={ players }
            onPlace={ () => onPlaceStone(hoveredSpace.x, hoveredSpace.y) }
          />
        }
        { possibleTargets?.possibleGrowthTargets &&
          possibleTargets.possibleGrowthTargets.map(space => (
            <GrowthTarget
              key={ `growth-target-${space.x}-${space.y}` }
              x={ space.x }
              y={ space.y }
              onTarget={ () => onMoveStone(space.x, space.y, selectedSpace!.x, selectedSpace!.y) }
            />
          ))
        }
        <defs>
          <filter id="back-glow">
            <feColorMatrix type="matrix" values="1 0 0 0   1
                                                 0 1 0 0   1
                                                 0 0 1 0   1
                                                 0 0 0 1   0"/>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="back-glow-color">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </>
  );
}