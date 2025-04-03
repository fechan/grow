import { useState } from 'react';
import { Board, Coordinate } from '../../../types/game';
import { getTargetStones } from '../possibleTargets';
import { GhostStone, GrowthTarget, StoneStackDisplay } from './StoneStackDisplay';
import { BoardGrid } from './boardParts/BoardGrid';
import { GlowFilters } from './boardParts/GlowFilters';

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
    <svg
      width="800"
      height="800"
      style={{
        backgroundColor: '#e0bb6c',
      }}
      onMouseMove={ onMouseMove }
      onClick={ onClick }
    >
      <defs>
        <GlowFilters />
      </defs>
      <BoardGrid boardHeight={ boardHeight } boardWidth={ boardWidth } />

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
            onTarget={ () => {
              onMoveStone(stack.x, stack.y, selectedSpace!.x, selectedSpace!.y);
              setSelectedSpace(null);
            } }
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
            onTarget={ () => {
              onMoveStone(space.x, space.y, selectedSpace!.x, selectedSpace!.y);
              setSelectedSpace(null);
            }}
          />
        ))
      }
    </svg>
  );
}