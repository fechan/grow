module.exports = class GrowGame {
  /**
   * Create a new game
   * @param {Number}    boardSize Size of the board
   * @param {String[]}  players   List of players
   */
   constructor(boardSize, players) {
    this.boardSize = boardSize;
    this.board = [];
    this.openSpaces = boardSize * boardSize;
    for (let x = 0; x < boardSize; x++) {
      this.board[x] = [];
      for (let y = 0; y < boardSize; y++) {
        this.board[x][y] = null;
      }
    }

    this.players = players;
    this.currentPlayer = players[0];
    this.playerHasPlaced = false; // Has the current player placed a new stone this turn?
    this.turn = 0;
  }

  /**
   * Enact a move on the board.
   * @param {String} player     Color of player playing the move
   * @param {String} type       Type of move (viz. "place", "move", "end")
   * @param {Number} [target_x] X coordinate of target space (placing or moving)
   * @param {Number} [target_y] Y coordinate of target space (placing or moving)
   * @param {Number} [from_x]   X coordinate of source space (moving)
   * @param {Number} [from_y]   Y coordinate of source space (moving)
   * @returns {Boolean} Whether the move was valid
   */
  processMove(player, type, target_x, target_y, from_x, from_y, dry_run = false) {
    if (player !== this.currentPlayer) {
      return false;
    }

    let target;
    switch (type) {
      case "end":
        if (this.turn < this.players.length && !this.playerHasPlaced) { // All players must place a stone on the first round
          return false;
        }
        this.turn++;
        this.currentPlayer = this.players[(this.players.indexOf(this.currentPlayer) + 1) % this.players.length];
        this.playerHasPlaced = false;
        for (let x = 0; x < this.boardSize; x++) {
          for (let y = 0; y < this.boardSize; y++) {
            let stone = this.board[x][y];
            if (stone?.heads) {
              if (!dry_run) this.board[x][y].movable = stone.player === this.currentPlayer ? stone.heads : 0;
            }
          }
        }
        return true;
        break;

      case "place":
        target = this.board[target_x][target_y];
        if (target === null && !this.playerHasPlaced) {
          if (!dry_run) {
            this.board[target_x][target_y] = {player: player, heads: 1, movable: 0};
            this.openSpaces--;
            this.playerHasPlaced = true;
          }
          return true;
        }
        break;

      case "move":
        let source = this.board[from_x][from_y];
        target = this.board[target_x][target_y];
        let sourceHasMovableHead = Boolean(source?.movable);
        let sourceIsOwnedByPlayer = source?.player === player;
        let targetIsAdjacent = Math.abs(target_x - from_x) + Math.abs(target_y - from_y) === 1;
        let targetIsAlongHighway = () => this.targetIsAlongHighway(this.currentPlayer, from_x, from_y, target_x, target_y);
        let targetIsNotEnemy = target === null || target.player === player;
        if (type === "move" && sourceHasMovableHead && sourceIsOwnedByPlayer && targetIsNotEnemy && (targetIsAdjacent || targetIsAlongHighway())) {
          if (!dry_run) {
            source.movable--;
            source.heads--;
            if (target === null) {
              this.board[target_x][target_y] = {player: player, heads: 1, movable: 0};
            } else {
              target.heads++;
            }
          }
          return true;
        }
        break;
    }
    return false;
  }

  /**
   * Check if the target space is accessible from the source space via a highway
   * @param {String} player    Color of player to check for
   * @param {Number} from_x    X coordinate of source space
   * @param {Number} from_y    Y coordinate of source space
   * @param {Number} target_x  X coordinate of target space
   * @param {Number} target_y  Y coordinate of target space
   * @returns {Boolean} Whether the target space is accessible from the source space
   */
  targetIsAlongHighway(player, from_x, from_y, target_x, target_y) {
    // Perform a breadth-first search along contiguous spaces of the player's color for the target space
    let queue = [{x: from_x, y: from_y}];
    let visited = {};
    while (queue.length > 0) {
      let current = queue.shift();
      if (current.x == target_x && current.y == target_y) { // HACK: should be === but sometimes there are strings for some reason. See getNeighbors
        return true;
      }
      let neighbors = this.getNeighbors(player, current.x, current.y);
      for (let neighbor of neighbors) {
        if (!visited[neighbor.x + "," + neighbor.y]) {
          visited[neighbor.x + "," + neighbor.y] = true;
          queue.push(neighbor);
        }
      }
    }
    return false;
  }

  /**
   * Get the neighbors of a space on the board that are the given player's color
   * @param {String} player Color of player to check for
   * @param {Number} x      X coordinate of space
   * @param {Number} y      Y coordinate of space
   * @returns {Object[]} List of coordinates {x, y} of neighbors of the player's color
   */
  getNeighbors(player, x, y) {
    [x, y] = [parseInt(x), parseInt(y)]; // HACK: strings are getting passed in and I'm too lazy to fix it right now
    let neighbors = [];
    for (let [x_delta, y_delta] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      let neighbor;
      try {
        neighbor = this.board[x + x_delta][y + y_delta];
      } catch {
        neighbor = null;
      }
      let neighborExists = neighbor != null;
      let neighborIsOwnedByPlayer = neighbor?.player === player;
      if (neighborExists && neighborIsOwnedByPlayer) {
        neighbors.push({x: x + x_delta, y: y + y_delta});
      }
    }
    return neighbors;
  }

  /**
   * Check if the game is over
   * @returns {Boolean} Whether the game is over
   */
  isGameOver() {
    return this.openSpaces === 0;
  }

  /**
   * Get the score at the current state of the game
   * @returns {Object} Dictionary of scores of each player
   */
  calculateScore() {
    let scores = {};
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        let space = this.board[x][y];
        scores[space.player] = (scores[space.player] || 0) + 1;
      }
    }
    return scores;
  }

  /**
   * Get the game state as a serializable object
   * @returns Game state
   */
  getGameState() {
    return {
      "board": this.board,
      "currentPlayer": this.currentPlayer,
      "playerHasPlaced": this.playerHasPlaced,
      "gameIsOver": isGameOver(),
      "scores": this.calculateScore(),
    }    
  }
}