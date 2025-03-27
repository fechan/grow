import { useState } from 'react';
import { Board, Coordinate } from '../../../types/game';
import { GhostStone, StoneStackDisplay } from './StoneStackDisplay';
import { getTargetStones } from '../possibleTargets';

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
  onMoveStone: (targetX: number, targetY: number, fromX: number, fromY: number) => void,
}

export function BoardDisplay({ board, players, currentPlayer, isCurrentPlayersTurn, onMoveStone }: BoardDisplayProps) {
  const [ hoveredSpace, setHoveredSpace ] = useState(null as Coordinate | null);
  const [ selectedSpace, setSelectedSpace ] = useState(null as Coordinate | null);

  const boardHeight = board[0].length;
  const boardWidth = board.length;

  const showGhostStone = (
    isCurrentPlayersTurn &&
    hoveredSpace &&
    !selectedSpace &&
    hoveredSpace.x !== null && hoveredSpace.y !== null && // a space is being hovered?
    hoveredSpace.x in board && // in bounds of board width?
    hoveredSpace.y in board[hoveredSpace.x] && // in bounds of board height?
    board[hoveredSpace.x][hoveredSpace.y] === null // hovered space is empty?
  );

  const possibleTargets = selectedSpace && getTargetStones(selectedSpace.x, selectedSpace.y, board, currentPlayer);

  function onMouseMove(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    setHoveredSpace(getBoardSpace(event.nativeEvent.offsetX, event.nativeEvent.offsetY));
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
            onTarget={ () => console.log("target selected", stack.x, stack.y) }
          />
        )
      }

      { showGhostStone &&
        <GhostStone
          x={ hoveredSpace.x! }
          y={ hoveredSpace.y! }
          currentPlayer={ currentPlayer }
          players={ players }
          onPlace={ () => console.log("placing stone at", hoveredSpace.x, hoveredSpace.y) }
        />
      }
    </svg>
  );
}