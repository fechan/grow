import { Dispatch } from "react";
import { Coordinate, StoneStack } from "../../../types/game";
import { sizes } from "./BoardDisplay";

const colors = [
  { head: 'fill-red-600', tail: 'fill-red-800' },
  { head: 'fill-blue-600', tail: 'fill-blue-800' },
  { head: 'fill-green-600', tail: 'fill-green-800' },
  { head: 'fill-yellow-600', tail: 'fill-yellow-800' },
];

interface StoneStackDisplayProps {
  stack: StoneStack,
  players: string[],
  ghost: boolean,
  isSelected: boolean,
  isPossibleTarget: boolean,
  onSelect: () => void,
  onDeselect: () => void,
  onTarget: () => void,
};

export function StoneStackDisplay({ stack, players, ghost, isSelected, isPossibleTarget, onSelect, onDeselect, onTarget }: StoneStackDisplayProps) {
  const type = stack.heads > 0 ? 'head' : 'tail';
  const color = colors[players.indexOf(stack.player)][type];

  function onClick(event: React.MouseEvent) {
    event.stopPropagation();

    if (isSelected) {
      onDeselect();
    } else if (isPossibleTarget) {
      onTarget();
    } else {
      onSelect();
    }
  }

  // TODO: add styles for movable stones while no selection is happening
  function getFilter() {
    if (isSelected) return 'url(#back-glow-color)';
    if (isPossibleTarget) return 'url(#back-glow)';
  }

  return (
    <g className="cursor-pointer" onClick={ onClick }>
      <circle
        cx={ stack.x * sizes.pitch + sizes.padding }
        cy={ stack.y * sizes.pitch + sizes.padding }
        r={ sizes.stoneRadius }
        style={
          { filter: getFilter() }
        }
        className={
          'stroke-2 ' +
          color + ' ' +
          (ghost ? 'opacity-50': 'opacity-100') + ' ' +
          (isPossibleTarget ? 'stroke-white' : '') + ' ' +
          (isSelected ? '!stroke-lime-400' : '') + ' '
        }
      />
      { stack.heads > 1 &&
        <text
          x={ stack.x * sizes.pitch + sizes.padding }
          y={ stack.y * sizes.pitch + sizes.padding }
          className="align-baseline center fill-white stroke-white text-2xl"
          style={{
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          }}
        >
          { stack.heads }
        </text>
      }
    </g>
  );
}

interface GhostStoneProps {
  x: number,
  y: number,
  currentPlayer: string,
  players: string[],
  onPlace: () => void,
}

export function GhostStone({ x, y, currentPlayer, players, onPlace }: GhostStoneProps) {
  return (
    <StoneStackDisplay
      stack={{
        player: currentPlayer,
        heads: 0,
        movable: 0,
        x: x,
        y: y,
      }}
      players={ players }
      ghost={ true }
      isSelected={ false }
      isPossibleTarget={ false }
      onSelect={ onPlace }
      onDeselect={ () => {} }
      onTarget={ () => {} }
    />
  );
}