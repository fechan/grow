import { sizes } from '../BoardDisplay';

interface BoardGridProps {
  boardWidth: number,
  boardHeight: number,
}

export function BoardGrid({ boardHeight, boardWidth }: BoardGridProps) {
  return (
    <>
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
    </>
  );
}