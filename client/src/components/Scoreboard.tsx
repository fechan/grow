import { Scores } from "../../../types/game";

const colors = [
  { normal: 'bg-red-600/10', turn: 'bg-red-600/80', border: 'border-red-600' },
  { normal: 'bg-blue-600/10', turn: 'bg-blue-600/80', border: 'border-blue-600' },
  { normal: 'bg-green-600/10', turn: 'bg-green-600/80', border: 'border-green-600' },
  { normal: 'bg-yellow-600/10', turn: 'bg-yellow-600/80', border: 'border-yellow-600' },
];

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
            className={
              "border rounded p-3 text-center w-full md:w-50 " +
              ( colors[players.indexOf(player)].border ) + " " +
              ( player === currentPlayer ? colors[players.indexOf(player)].turn : colors[players.indexOf(player)].normal )
            }
          >
            <h1 className="font-bold">
              { player }
              &nbsp;
              <span className="font-normal">({ ['red', 'blue', 'green', 'yellow'][players.indexOf(player)] })</span>
            </h1>
            <p>Score: { scores[player] || 0 }</p>
          </section>
        ))
      }
    </>
  );
}