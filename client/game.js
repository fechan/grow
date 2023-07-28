import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PITCH = 50;
const STONE_R = PITCH / 2;
const PADDING = 50;
export const COLORS = ["red", "blue", "green", "yellow"];

export function emptyGameState(boardSize) {
  const emptyGame = {
    board: [],
    players: [],
    currentPlayer: "",
    playerHasPlaced: true,
    gameIsOver: true,
    scores: {}
  };
  for (let x = 0; x < boardSize; x++) {
    emptyGame.board[x] = [];
    for (let y = 0; y < boardSize; y++) {
      emptyGame.board[x][y] = null;
    }
  }

  return emptyGame;
}

export function update(gameState) {
  updatePlayers(gameState);
  updateBoard(gameState);
}

function updatePlayers(gameState) {
  let { scores, players, currentPlayer } = gameState;
  let playerList = document.getElementById("player-scores");
  playerList.querySelectorAll(".player").forEach(e => e.remove());

  let playerTemplate = document.querySelector(".player-template");

  for (let [i, player] of players.entries()) {
    let playerNode = playerTemplate.content.cloneNode(true);
    let playerLi = playerNode.querySelector("li");
    playerLi.querySelector(".name").textContent = player;
    playerLi.querySelector(".color").textContent = COLORS[i];
    playerLi.querySelector(".score").textContent = scores[player] ?? 0;
    if (player === currentPlayer) playerLi.classList.add("current-player");
    playerList.append(playerNode);
  }
}

function updateBoard(gameState) {
  const { board, currentPlayer, playerHasPlaced, gameIsOver, scores } = gameState;
  const boardSize = board.length;

  const boardSVG = d3.select("#board");

  // vertical lines
  boardSVG.selectAll("g")
    .data(Array(boardSize).keys(), d => "v" + d)
    .join(
      enter => enter.append("line")
        .attr("x1", d => d * PITCH + PADDING)
        .attr("y1", PADDING)
        .attr("x2", d => d * PITCH + PADDING)
        .attr("y2", boardSize * PITCH)
        .attr("stroke", "black")
        .attr("stroke-width", "2")
    )

  // horizontal lines
  boardSVG.selectAll("g")
  .data(Array(boardSize).keys(), d => "h" + d)
  .join(
    enter => enter.append("line")
      .attr("y1", d => d * PITCH + PADDING)
      .attr("x1", PADDING)
      .attr("y2", d => d * PITCH + PADDING)
      .attr("x2", boardSize * PITCH)
      .attr("stroke", "black")
  )

  // pieces
  boardSVG.selectAll("g")
    .data(
      board.flat().filter(d => d !== null),
      d => `${d.x},${d.y}` // key
      )
    .join(
      enter => {
        enter.append("circle")
          .attr("cx", d => d.x * PITCH + PADDING)
          .attr("cy", d => d.y * PITCH + PADDING)
          .attr("r", STONE_R)

        enter.filter(d => d.heads > 1)
          .append("text")
          .text(d => d.heads)
          .attr("x", d => d.x * PITCH + PADDING)
          .attr("y", d => d.y * PITCH + PADDING)
          .attr("text-anchor", "middle")
          .attr("stroke", "white")
          .attr("fill", "white")
          .attr("dominant-baseline", "middle")
          .attr("font-size", STONE_R)

        return enter;
      })
}
