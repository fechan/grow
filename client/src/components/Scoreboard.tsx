import { Scores } from "../../../types/game";

interface ScoreboardProps {
  players: string[],
  scores: Scores,
  currentPlayer: string,
}

export function Scoreboard({ players, scores, currentPlayer }: ScoreboardProps) {
  return (
    <>
      {
        players.map(player => (
          <section
            className={ "border rounded p-3 text-center" + (player === currentPlayer ? " bg-yellow-500/30 " : "") }
          >
            <h1 className="font-bold">{ player }</h1>
            <p>Score: { scores[player] }</p>
          </section>
        ))
      }
    </>
  );
}