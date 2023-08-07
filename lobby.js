const Game = require("./game");

module.exports = class Lobby {
  constructor(lobbyCode) {
    this.lobbyCode = lobbyCode;

    this.host;
    this.game;
    this.players = [];
  }

  startGame() {
    this.game = new Game(15, shuffle(this.players.slice()));
  }

  addPlayer(playerName) {
    if (this.players.length === 0) {
      this.host = playerName;
    }

    let counter = 1;
    let playerNameBase = playerName;
    while (this.players.includes(playerName)) {
      counter++;
      playerName = playerNameBase + counter;
    }
    this.players.push(playerName);

    return playerName;
  }

  removePlayer(playerName) {
    this.players.splice(this.players.indexOf(playerName), 1);
    if (this.host === playerName && this.players.length > 0) {
      this.host = this.players[0];
    }

    return playerName;
  }

  getLobbyInfo() {
    return {
      "lobbyCode": this.lobbyCode,
      "players": this.players,
      "host": this.host
    };
  }

  getIsStale() {
    return this.players.length === 0;
  }
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}