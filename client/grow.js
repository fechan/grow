import * as game from "./game.js"

function init() {
  let myName;
  game.update(game.emptyGameState(15));

  let socket = io();

  socket.on("lobbyJoined", params => {
    let { lobbyInfo, joinedPlayer } = params;
    myName = joinedPlayer;

    updateLobbyScreen(lobbyInfo, myName);
    setMenuScreen("lobby");
  });

  socket.on("lobbyInfoChanged", params => {
    let { lobbyInfo } = params;
    updateLobbyScreen(lobbyInfo, myName);
  });

  socket.on("gameStateChanged", params => {
    let { gameState } = params;
    game.update(gameState);
    document.getElementById("menu-modal").classList.add("hidden");
  });

  document.getElementById("new-lobby").addEventListener("click", () => {
    updatePlayerNameScreen(true, () => {
      let playerName = document.getElementById("nickname").value;
      playerName = playerName == "" ? "anonymous" : playerName;
      socket.emit("createLobby", {"hostPlayerName": playerName})
    });
    setMenuScreen("player-name");
  });

  document.getElementById("start-game").addEventListener("click", () => {
    socket.emit("startGame")
  });

  document.getElementById("join-game").addEventListener("click", () => {
    updatePlayerNameScreen(false, () => {
      let lobby = document.getElementById("lobby-code-input").value;
      let playerName = document.getElementById("nickname").value;
      playerName = playerName == "" ? "anonymous" : playerName;
      socket.emit("joinLobby", {"playerName": playerName, "lobby": lobby})
    });
    setMenuScreen("player-name");
  });
}

/**
 * Show the given screen on the menu modal
 * @param {String} screenID ID of screen to change to
 */
function setMenuScreen(screenID) {
  let modalContent = document.querySelector("#menu-modal .modal-content");

  for (let screen of modalContent.querySelectorAll(".menu-screen")) {
    if (screen.id !== screenID) {
      screen.classList.add("hidden");
    } else {
      screen.classList.remove("hidden");
    }
  }
}

/**
 * Update the player name screen
 * @param {Boolean} creatingGame  true if the client is creating a game
 * @param {Function} onNameCommit Callback function to run when player name committed
 */
function updatePlayerNameScreen(creatingGame, onNameCommit) {
  let submitBtn = document.getElementById("submit-nickname");
  submitBtn.textContent = creatingGame ? "Create game" : "Join game";
  submitBtn.addEventListener("click", onNameCommit);
}

/**
 * Update the lobby screen
 * @param {Object} lobbyInfo  New lobby information
 * @param {String} myName     Current player's name
 */
function updateLobbyScreen(lobbyInfo, myName) {
  let { lobbyCode, players, host } = lobbyInfo;
  updateLobbyCode(lobbyCode);
  updatePlayerList(players, host, myName);

  let startGameBtn = document.getElementById("start-game");
  let waitingForHost = document.getElementById("waiting-for-host");
  if (host == myName) {
    startGameBtn.classList.remove("hidden");
    waitingForHost.classList.add("hidden");
  } else {
    startGameBtn.classList.add("hidden");
    waitingForHost.classList.remove("hidden");
  }
}

/**
 * Update the lobby code display
 * @param {String} code Lobby code
 */
function updateLobbyCode(code) {
  document.getElementById("lobby-code").textContent = code;
}

/**
 * Update the player list display
 * @param {String[]}  players List of players
 * @param {String}    host    Name of host
 * @param {String}    myName  Name of current player
 */
function updatePlayerList(players, host, myName) {
  let playerList = document.getElementById("lobby-player-list");
  let playerTemplate = playerList.querySelector(".player-template");

  playerList.querySelectorAll("li").forEach(player => player.remove());

  for (let player of players) {
    let playerNode = playerTemplate.content.cloneNode(true);
    let playerLi = playerNode.querySelector("li");
    playerLi.append(document.createTextNode(player));
    if (host == player) playerLi.append(document.createTextNode("(HOST)"));
    if (myName == player) playerLi.append(document.createTextNode("(YOU)"));
    playerList.append(playerNode);
  }
}

init();