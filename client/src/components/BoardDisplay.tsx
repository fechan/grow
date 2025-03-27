import { Board } from '../../../types/game';
import { StoneStackDisplay } from './StoneStackDisplay';

export const sizes = {
  pitch: 50,
  padding: 50,
  stoneRadius: 50 / 2 - 2,
};

interface BoardDisplayProps {
  board: Board,
  players: string[],
}

export function BoardDisplay({ board, players }: BoardDisplayProps) {
  const boardHeight = board[0].length;
  const boardWidth = board.length;

  return (
    <svg
      width="800"
      height="800"
      style={{
        backgroundColor: '#e0bb6c',
      }}
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
        board.flat().map(space => space ?
          <StoneStackDisplay
            stack={ space }
            players={ players }            
          />
          : null
        )
      }
    </svg>
  );
}