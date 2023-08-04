import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PITCH = 50;
const STONE_R = PITCH / 2;
const PADDING = 50;
export const COLORS = ["red", "blue", "green", "yellow"];

let selectedSource = null;

/**
 * Get an empty/placeholder game state
 * @param {Number} boardSize Size of empty board
 * @returns {Object} Emtpy game state
 */
export function emptyGameState(boardSize) {
  const emptyGame = {
    board: [],
    players: ["Red", "Blue", "Green", "Yellow"],
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

/**
 * Update the Grow game display with the given board state
 * @param {Object}    gameState Board state
 * @param {String}    myName    Name of the client's player
 * @param {Function}  onPlace   Callback to run when the player places a stone
 * @param {Function}  onMove    Callback to run when the player moves a stone
 */
export function update(gameState, myName, onPlace, onMove) {
  updatePlayers(gameState);
  updateBoard(gameState, myName, onPlace, onMove);
  updateEndTurnBtn(gameState, myName);
}

/**
 * Enable/disable the end turn button based on the game state
 * 
 * You can only end turn iff: it's your turn AND
 * it's not the first turn (where you must place a stone/score a point)
 * @param {Object} gameState  Game state
 * @param {String} myName     Name of the client's player
 */
function updateEndTurnBtn(gameState, myName) {
  const { currentPlayer, scores } = gameState;

  let enableEndTurn = currentPlayer === myName && scores[myName] > 0;
  document.getElementById("end-turn").disabled = !enableEndTurn;
}

/**
 * Update the player/score list based on the game state
 * @param {Object} gameState Game state
 */
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

/**
 * Get the space on the board the mouse is hovering over, as an [x, y] pair.
 * 
 * The returned value is not necessarily on the board. You should check that
 * the space actually lies within the board bounds!
 * @param {MouseEvent} mouseMoveEvent Mouse event corresponding to mouse hover
 * @returns {Number[2]} [x, y] pair of space being hovered over
 */
function getMouseBoardPos(mouseMoveEvent) {
  let [mouseX, mouseY] = d3.pointer(mouseMoveEvent);

  let x = Math.round((mouseX - PADDING) / PITCH);
  let y = Math.round((mouseY - PADDING) / PITCH);

  return [x, y];
}

/**
 * Hover a ghost piece on the board where the mouse is hovering over, if
 * it is the client's turn and they haven't placed yet
 * @param {MouseEvent}  mouseMoveEvent  Mouse event corresponding to mouse hover
 * @param {Object}      gameState       Game state
 * @param {String}      myName          Name of the client's player
 * @param {Function}    onPlace         Callback to run when a stone is placed
 */
function hoverUnplacedPiece(mouseMoveEvent, gameState, myName, onPlace) {
  const { players, playerHasPlaced, currentPlayer, board } = gameState;

  // array will contain the unplaced piece iff there is one
  // and the position is valid
  let unplacedPiece = [];
  let placeStone;

  if (myName === gameState.currentPlayer && !playerHasPlaced && selectedSource === null) {
    let [x, y] = getMouseBoardPos(mouseMoveEvent);

    if (x in board && y in board[x] && board[x][y] === null) {
      unplacedPiece = [{
        x: x,
        y: y,
        color: COLORS[players.indexOf(currentPlayer)],
        heads: 1,
      }];

      placeStone = () => onPlace(x, y);
    }
  }

  if (unplacedPiece.length === 0) onPlace = null;

  const boardSVG = d3.select("#board");
  boardSVG.on("click", placeStone);
  
  boardSVG.selectAll("circle.unplaced-stone")
    .data(unplacedPiece, d => "unplaced-stone")
    .join(
      enter => enter.append("circle").classed("unplaced-stone", true)
        .attr("cx", d => d.x * PITCH + PADDING)
        .attr("cy", d => d.y * PITCH + PADDING)
        .attr("r", STONE_R)
        .attr("fill", d => d3.color(d.color).copy({opacity: 0.5})),
      update => update.attr("cx", d => d.x * PITCH + PADDING)
        .attr("cy", d => d.y * PITCH + PADDING),
      exit => exit.remove()
      )
  
}

function moveStone(mouseDownEvent, gameState, myName, onMove) {
  const { currentPlayer, board } = gameState;

  if (myName !== currentPlayer) return;

  let [x, y] = getMouseBoardPos(mouseDownEvent);
  if (x in board && y in board[x]) {
    if (selectedSource) {
      if (x == selectedSource[x] && y == selectedSource[y]) {
        selectedSource = null;
        return;
      }
      let target = board[x][y];
      if (target == null || target.player == myName) {
        let [fromX, fromY] = selectedSource;
        onMove(x, y, fromX, fromY);
      }
      selectedSource = null;
    } else {
      let source = board[x][y];
      if (source && source.movable > 0 && source.player == myName) {
        selectedSource = [x, y];
      }
    }
  }
}

/**
 * Update the board display based on the game state
 * @param {Object}    gameState Game state
 * @param {String}    myName    Name of the client's player
 * @param {Function}  onPlace   Callback to run when a stone is placed
 * @param {Function}  onPlace   Callback to run when a stone is moved
 */
function updateBoard(gameState, myName, onPlace, onMove) {
  const { players, board, currentPlayer, playerHasPlaced, gameIsOver, scores } = gameState;
  const boardSize = board.length;

  const boardSVG = d3.select("#board")
    .on("mousemove", e => hoverUnplacedPiece(e, gameState, myName, onPlace))
    .on("click.moveStone", e => moveStone(e, gameState, myName, onMove))

  // vertical lines
  boardSVG.selectAll("line.line-vertical")
    .data(Array(boardSize).keys(), d => "v" + d)
    .join(
      enter => enter.append("line")
        .classed("line-vertical", true)
        .attr("x1", d => d * PITCH + PADDING)
        .attr("y1", PADDING)
        .attr("x2", d => d * PITCH + PADDING)
        .attr("y2", boardSize * PITCH),
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
      .attr("x2", boardSize * PITCH),
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
        let stone = enter.append("g")
          .classed("stone", true)

        stone.append("circle")
          .attr("cx", d => d.x * PITCH + PADDING)
          .attr("cy", d => d.y * PITCH + PADDING)
          .attr("r", STONE_R)
          .attr("fill", d => (d.heads > 0) ? COLORS[players.indexOf(d.player)] : d3.color(COLORS[players.indexOf(d.player)]).darker(.95))

        stone.append("text")
          .text(d => d.heads <= 1 ? "" : d.heads)
          .attr("x", d => d.x * PITCH + PADDING)
          .attr("y", d => d.y * PITCH + PADDING)
          .attr("font-size", STONE_R)

        return stone;
        },
      update => {
        update.classed("movable", d => d.movable > 0)

        update.select("circle")
          .attr("fill", d => (d.heads > 0) ? COLORS[players.indexOf(d.player)] : d3.color(COLORS[players.indexOf(d.player)]).darker(.95))

        update.select("text").text(d => d.heads <= 1 ? "" : d.heads)

        return update;
        },
      exit => exit.remove(),
      )
}
