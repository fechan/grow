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
            key={ player }
            className={ "border rounded p-3 text-center w-50" + (player === currentPlayer ? " bg-yellow-500/30 " : "") }
          >
            <h1 className="font-bold">
              { player }
              &nbsp;
              ({ ['red', 'blue', 'green', 'yellow'][players.indexOf(player)] })
            </h1>
            <p>Score: { scores[player] || 0 }</p>
          </section>
        ))
      }
    </>
  );
}