import { FancyButton } from "./FancyButton";

interface EndTurnButtonProps {
  onEndTurn: () => void,
  isCurrentPlayersTurn: boolean,
  playerHasPlaced: boolean,
}

export function EndTurnButton({ onEndTurn, isCurrentPlayersTurn, playerHasPlaced }: EndTurnButtonProps) {
  return (
    <FancyButton
      className="w-full"
      onClick={ onEndTurn }
      disabled={ !isCurrentPlayersTurn }
    >
      End turn
    </FancyButton>
  )
}