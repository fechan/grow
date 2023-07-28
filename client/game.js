import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PITCH = 50;
const STONE_R = PITCH / 2;
const PADDING = 50;
export const COLORS = ["red", "blue", "green", "yellow"];

export function emptyGameState(boardSize) {
  const emptyGame = {
    board: [],
    players: [""],
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

export function update(gameState, myName, onPlace) {
  updatePlayers(gameState);
  updateBoard(gameState, myName, onPlace);
  updateEndTurnBtn(gameState, myName);
}

function updateEndTurnBtn(gameState, myName) {
  const { currentPlayer, scores, playerHasPlaced } = gameState;
  // you can only end turn if: it's your turn AND it's not the first turn (where you must place a stone/score a point)
  let enableEndTurn = currentPlayer === myName && scores[myName] > 0;
  document.getElementById("end-turn").disabled = !enableEndTurn;
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

function hoverUnplacedPiece(mouseMoveEvent, gameState, myName, onPlace) {
  const { players, playerHasPlaced, currentPlayer, board } = gameState;

  // array will contain the unplaced piece iff there is one
  // and the position is valid
  let unplacedPiece = [];

  if (myName === gameState.currentPlayer && !playerHasPlaced) {
    let [mouseX, mouseY] = d3.pointer(mouseMoveEvent);

    let x = Math.round((mouseX - PADDING) / PITCH);
    let y = Math.round((mouseY - PADDING) / PITCH);

    if (x in board && y in board[x] && board[x][y] === null) {
      unplacedPiece = [{
        x: x,
        y: y,
        color: COLORS[players.indexOf(currentPlayer)],
        heads: 1,
      }];
    }
  }

  const boardSVG = d3.select("#board");
  boardSVG.selectAll("circle.unplaced-stone")
    .data(unplacedPiece, d => "unplaced-stone")
    .join(
      enter => enter.append("circle").classed("unplaced-stone", true)
        .attr("cx", d => d.x * PITCH + PADDING)
        .attr("cy", d => d.y * PITCH + PADDING)
        .attr("r", STONE_R)
        .attr("stroke", d => d3.color(d.color).copy({opacity: 0.5}))
        .attr("fill", d => d3.color(d.color).copy({opacity: 0.5}))
        .on("click", (e, d) => onPlace(d.x, d.y)),
      update => update.attr("cx", d => d.x * PITCH + PADDING)
        .attr("cy", d => d.y * PITCH + PADDING),
      exit => exit.remove()
      )
  
}

function updateBoard(gameState, myName, onPlace) {
  const { players, board, currentPlayer, playerHasPlaced, gameIsOver, scores } = gameState;
  const boardSize = board.length;

  const boardSVG = d3.select("#board").on("mousemove", e => hoverUnplacedPiece(e, gameState, myName, onPlace))

  // vertical lines
  boardSVG.selectAll("line.line-vertical")
    .data(Array(boardSize).keys(), d => "v" + d)
    .join(
      enter => enter.append("line")
        .classed("line-vertical", true)
        .attr("x1", d => d * PITCH + PADDING)
        .attr("y1", PADDING)
        .attr("x2", d => d * PITCH + PADDING)
        .attr("y2", boardSize * PITCH)
        .attr("stroke", "black")
        .attr("stroke-width", "2"),
      update => update.selection(),
      exit => exit.remove(),
      )

  // horizontal lines
  boardSVG.selectAll("line.line-horizontal")
  .data(Array(boardSize).keys(), d => "h" + d)
  .join(
    enter => enter.append("line")
      .classed("line-horizontal", true)
      .attr("y1", d => d * PITCH + PADDING)
      .attr("x1", PADDING)
      .attr("y2", d => d * PITCH + PADDING)
      .attr("x2", boardSize * PITCH)
      .attr("stroke", "black"),
    update => update.selection(),
    exit => exit.remove(),
    )

  // pieces
  boardSVG.selectAll("g.stone")
    .data(
      board.flat().filter(d => d !== null),
      d => `${d.x},${d.y}` // key
      )
    .join(
      enter => {
        let stone = enter.append("g").classed("stone", true)

        stone.append("circle")
          .attr("cx", d => d.x * PITCH + PADDING)
          .attr("cy", d => d.y * PITCH + PADDING)
          .attr("r", STONE_R)
          .attr("stroke", d => COLORS[players.indexOf(d.player)])
          .attr("fill", d => COLORS[players.indexOf(d.player)])

        stone.filter(d => d.heads > 1)
          .append("text")
          .text(d => d.heads)
          .attr("x", d => d.x * PITCH + PADDING)
          .attr("y", d => d.y * PITCH + PADDING)
          .attr("text-anchor", "middle")
          .attr("stroke", "white")
          .attr("fill", "white")
          .attr("dominant-baseline", "middle")
          .attr("font-size", STONE_R)

        return stone;
        },
      update => {
        update.select("circle")
          .attr("stroke", d => COLORS[players.indexOf(d.player)])
          .attr("fill", d => COLORS[players.indexOf(d.player)])

        update.select("text")
          .filter(d => d.heads > 1)
          .append("text")
          .text(d => d.heads)

        return update;
        },
      exit => exit.remove(),
      )
}
