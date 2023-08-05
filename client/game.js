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

/**
 * Handle picking up and moving a stone, including UI hints/highlights for valid pick-up/drop targets
 * @param {MouseEvent}  mouseDownEvent  Mouse event that triggered the stone move
 * @param {Object}      gameState       Current game state
 * @param {String}      myName          Name of client's player
 * @param {Function}    onMove          Callback to run when a move is made
 * @returns 
 */
function moveStone(mouseDownEvent, gameState, myName, onMove) {
  const { currentPlayer, board } = gameState;

  if (myName !== currentPlayer) return;

  let [x, y] = getMouseBoardPos(mouseDownEvent);
  if (x in board && y in board[x]) {
    if (selectedSource) {
      // reset UI hints/highlighting of targetable stones
      d3.select("g.moving").classed("moving", false)
      d3.selectAll("g.growth-target").remove()
      d3.selectAll("g.stone")
        .classed("target", false)
        .classed("movable", d => d.movable > 0)

      // ignore move if target is the same as the source
      if (x == selectedSource[0] && y == selectedSource[1]) {
        selectedSource = null;
        return;
      }

      // perform the move if otherwise allowed
      let target = board[x][y];
      if (target == null || target.player == myName) {
        let [fromX, fromY] = selectedSource;
        onMove(x, y, fromX, fromY);
      }

      // clear selected source stone
      selectedSource = null;

    } else {
      let source = board[x][y];
      if (source && source.movable > 0 && source.player == myName) {
        selectedSource = [x, y];

        // remove highlights for movable stones, only highlight selected source
        d3.selectAll("g.movable")
          .classed("moving", d => d.x === x && d.y === y)
          .classed("movable", false)

        // calculate possible target stones
        const {possibleHighwayTargets, possibleGrowthTargets} = getTargetStones(x, y, board, myName);

        // highlight possible targets due to highway rule
        d3.selectAll("g.stone")
          .classed("target", d => possibleHighwayTargets[d.x + "," + d.y])

        // highlight possible targets due to normal growth into adjacent empty space
        d3.select("#board").selectAll("g.growth-target")
          .data(possibleGrowthTargets)
          .join(enter => {
              let stone = enter.append("g")
                .classed("target", true)
                .classed("growth-target", true)
            
              stone.append("circle")
                .attr("cx", d => d.x * PITCH + PADDING)
                .attr("cy", d => d.y * PITCH + PADDING)
                .attr("r", STONE_R)

              return stone
            })

        d3.selectAll("g.stone").raise();
      }
    }
  }
}

/**
 * Get possible target stones for the given source stone that is being moved
 * @param {Number}    sourceX X coordinate of stone being moved
 * @param {Number}    sourceY Y coordinate of stone being moved
 * @param {Object[]}  board Board state
 * @param {String}    myName Name of client's player
 * @returns {Object} An Object containing possible targets due to highway/growth rules. See top of function definition for clarification
 */
function getTargetStones(sourceX, sourceY, board, myName) {
  // NOTE: `possibleHighwayTargets` is part of the return value!
  // It maps coordinate strings "x,y" to bool of whether it is a valid target
  // this map's keys double as the `visited` nodes list in the graph search for the highway rule
  const possibleHighwayTargets = {};
  const searchMe = [];

  // NOTE: `possibleGrowthTargets` is part of the return value!
  // It is an array of {x: x, y: y} coordinates for adjacent empty spaces (where you can grow into and score pts)
  const possibleGrowthTargets = [];

  // first check for adjacent open spaces
  for (const [dx, dy] of [[-1,0] ,[1,0], [0,-1], [0,1]]) {
    let [targetX, targetY] = [sourceX+dx, sourceY+dy];
    if (targetX in board && targetY in board[targetX]) {
      let target = board[targetX][targetY];
      if (target === null) {
        possibleGrowthTargets.push({x: targetX, y: targetY});
      } else if (target.player === myName) {
        searchMe.push([targetX, targetY]);
      }
    }
  }

  // do graph search
  while (searchMe.length > 0) {
    let [curX, curY] = searchMe.shift()
    let isValid = board[curX][curY]?.player === myName && !(curX === sourceX && curY === sourceY);
    possibleHighwayTargets[curX + "," + curY] = isValid;

    if (isValid) {
      // add all unvisited neighbors
      for (const [dx, dy] of [[-1,0] ,[1,0], [0,-1], [0,1]]) {
        let [targetX, targetY] = [curX+dx, curY+dy];
        if (targetX in board && targetY in board[targetX]) {
          if (!(targetX + "," + targetY in possibleHighwayTargets)) {
            searchMe.push([targetX, targetY]);
          }
        }
      }
    }
  }

  return {possibleHighwayTargets, possibleGrowthTargets};
}

/**
 * Update the board's cursor to be a pointer or default depending on game state
 * @param {MouseEvent} mouseMoveEvent Mouse move event
 * @param {Object}     gameState      Current game state
 * @param {String}     myName         Name of client's player
 */
function updateCursor(mouseMoveEvent, gameState, myName) {
  let { board, playerHasPlaced, currentPlayer } = gameState;
  let [x, y] = getMouseBoardPos(mouseMoveEvent);

  let myTurn = currentPlayer == myName;
  let spaceInBoard = x in board && y in board;
  let spaceHasPiece = spaceInBoard && board[x][y] !== null;
  let canPlacePieceOnSpace = spaceInBoard && !playerHasPlaced && !spaceHasPiece

  let boardSVG = document.getElementById("board");
  if (myTurn && canPlacePieceOnSpace) {
    boardSVG.classList.add("cursor-pointer");
  } else {
    boardSVG.classList.remove("cursor-pointer");
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
    .on("mousemove.unplaced", e => hoverUnplacedPiece(e, gameState, myName, onPlace))
    .on("mousemove.cursor", e => updateCursor(e, gameState, myName))
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
          .attr("fill", d => (d.heads > 0) ? COLORS[players.indexOf(d.player)] : d3.color(COLORS[players.indexOf(d.player)]).darker(1.5))

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
          .attr("fill", d => (d.heads > 0) ? COLORS[players.indexOf(d.player)] : d3.color(COLORS[players.indexOf(d.player)]).darker(1.5))

        update.select("text").text(d => d.heads <= 1 ? "" : d.heads)

        return update;
        },
      exit => exit.remove(),
      )

  boardSVG.selectAll("g.stone.movable").raise();
  
}
