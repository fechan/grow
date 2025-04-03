import { StoneStack } from "../../../types/game";
import { sizes } from "./BoardDisplay";

const colors = [
  { head: 'fill-red-600', tail: 'fill-red-900' },
  { head: 'fill-blue-600', tail: 'fill-blue-900' },
  { head: 'fill-green-600', tail: 'fill-green-900' },
  { head: 'fill-yellow-600', tail: 'fill-yellow-900' },
];

interface StoneStackDisplayProps {
  stack: StoneStack,
  players: string[] | null,
  ghost: boolean,
  isSelected: boolean,
  isPossibleTarget: boolean,
  onSelect: () => void,
  onDeselect: () => void,
  onTarget: () => void,
};

export function StoneStackDisplay({ stack, players, ghost, isSelected, isPossibleTarget, onSelect, onDeselect, onTarget }: StoneStackDisplayProps) {
  const type = stack.heads > 0 ? 'head' : 'tail';
  const color = players ? colors[players.indexOf(stack.player)][type] : 'fill-transparent';

  function onClick(event: React.MouseEvent) {
    event.stopPropagation();

    if (isSelected || (!(ghost || isPossibleTarget) && stack.movable === 0)) {
      onDeselect();
    } else if (isPossibleTarget) {
      onTarget();
    } else {
      onSelect();
    }
  }

  function getFilter() {
    if (isSelected) return 'url(#back-glow-color)';
    if (isPossibleTarget || stack.movable > 0) return 'url(#back-glow)';
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
          'stroke-2 stroke-black ' +
          color + ' ' +
          (ghost ? 'opacity-50': 'opacity-100') + ' ' +
          (isPossibleTarget || stack.movable ? 'stroke-white' : '') + ' ' +
          (isSelected ? '!stroke-lime-400' : '') + ' '
        }
      />
      { stack.heads > 1 &&
        <text
          x={ stack.x * sizes.pitch + sizes.padding }
          y={ stack.y * sizes.pitch + sizes.padding + 2 }
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

/**
 * The ghost stone that appears where you can drop a stone.
 */
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

interface GrowthTargetProps {
  x: number,
  y: number,
  onTarget: () => void,
}

/**
 * A glowing target that appears if you can move a stone into an empty space.
 */
export function GrowthTarget({ x, y, onTarget }: GrowthTargetProps) {
  return (
    <StoneStackDisplay
      stack={({
        player: '',
        heads: 0,
        movable: 0,
        x: x,
        y: y,
      })}
      players={ null }
      ghost={ false }
      isSelected={ false }
      isPossibleTarget={ true }
      onSelect={ () => {} }
      onDeselect={ () => {} }
      onTarget={ onTarget }
    />
  );
}