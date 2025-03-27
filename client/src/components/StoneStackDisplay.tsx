import { StoneStack } from "../../../types/game";
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
};

export function StoneStackDisplay({ stack, players }: StoneStackDisplayProps) {
  const type = stack.heads > 0 ? 'head' : 'tail';
  const color = colors[players.indexOf(stack.player)][type];

  return (
    <circle
      cx={ stack.x * sizes.pitch + sizes.padding }
      cy={ stack.y * sizes.pitch + sizes.padding }
      r={ sizes.stoneRadius }
      className={ color }
    />
  );
}