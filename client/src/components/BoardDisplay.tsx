import { useState } from 'react';
import { Board } from '../../../types/game';
import { GhostStone, StoneStackDisplay } from './StoneStackDisplay';

export const sizes = {
  pitch: 50,
  padding: 50,
  stoneRadius: 50 / 2 - 2,
};

interface BoardDisplayProps {
  board: Board,
  players: string[],
  currentPlayer: string,
  isCurrentPlayersTurn: boolean,
  onMoveStone: (targetX: number, targetY: number, fromX: number, fromY: number) => void,
}

export function BoardDisplay({ board, players, currentPlayer, isCurrentPlayersTurn, onMoveStone }: BoardDisplayProps) {
  const [ hoveredSpace, setHoveredSpace ] = useState({
    x: null as number | null,
    y: null as number | null,
  });

  const boardHeight = board[0].length;
  const boardWidth = board.length;

  const showGhostStone = (
    isCurrentPlayersTurn &&
    hoveredSpace.x !== null && hoveredSpace.y !== null && // a space is being hovered?
    hoveredSpace.x in board && // in bounds of board width?
    hoveredSpace.y in board[hoveredSpace.x] && // in bounds of board height?
    board[hoveredSpace.x][hoveredSpace.y] === null // hovered space is empty?
  );

  function onMouseMove(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    setHoveredSpace({
      x: Math.round((event.nativeEvent.offsetX - sizes.padding) / sizes.pitch),
      y: Math.round((event.nativeEvent.offsetY - sizes.padding) / sizes.pitch),
    });
  }  

  return (
    <svg
      width="800"
      height="800"
      style={{
        backgroundColor: '#e0bb6c',
      }}
      onMouseMove={ onMouseMove }
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
        board.flat().map(space => space &&
          <StoneStackDisplay
            key={ `stone-stack-${space.x}-${space.y}` }
            stack={ space }
            players={ players }
            ghost={ false }
          />
        )
      }

      { showGhostStone &&
        <GhostStone
          x={ hoveredSpace.x! }
          y={ hoveredSpace.y! }
          currentPlayer={ currentPlayer }
          players={ players }
        />
      }
    </svg>
  );
}