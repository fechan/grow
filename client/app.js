import * as game from "./game.js"

function init() {
  let myName;
  let lastGameState = game.emptyGameState(15);
  game.update(lastGameState);

  let moveSfx = new Audio("./sfx/Move.ogg");

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

  let onPlace = (x, y) => socket.emit("playMove", {player: myName, type: "place", target_x: x, target_y: y})
  let onMove = (target_x, target_y, from_x, from_y) => socket.emit("playMove", {player: myName, type: "move", target_x: target_x, target_y: target_y, from_x: from_x, from_y: from_y})
  socket.on("gameStateChanged", params => {
    let { gameState } = params;

    if ("boardChanges" in gameState) {
      moveSfx.play();
      applyBoardChanges(lastGameState.board, gameState.boardChanges)
      gameState.board = lastGameState.board;
    }
    game.update(gameState, myName, onPlace, onMove);
    lastGameState = gameState;

    if (gameState.gameIsOver) {
      document.getElementById("menu-modal").classList.remove("hidden");
      setMenuScreen("game-over");
    } else {
      document.getElementById("menu-modal").classList.add("hidden");
    }
  });

  document.getElementById("end-turn").addEventListener("click", () => socket.emit("playMove", {player: myName, type: "end"}));

  document.getElementById("submit-nickname").addEventListener("click", () => {
    let playerName = document.getElementById("nickname").value;
    playerName = playerName == "" ? "anonymous" : playerName;
    socket.emit("createLobby", {"hostPlayerName": playerName})
  });
  document.getElementById("new-lobby").addEventListener("click", () => setMenuScreen("player-name"));

  document.getElementById("start-game").addEventListener("click", () => {
    socket.emit("startGame")
  });

  document.getElementById("submit-nickname-join").addEventListener("click", () => {
    const lobbyCodeInput =  document.getElementById("lobby-code-input");
    const lobby = lobbyCodeInput.value;
    let playerName = document.getElementById("nickname-join").value;
    playerName = playerName == "" ? "anonymous" : playerName;
    socket.emit("joinLobby", {"playerName": playerName, "lobby": lobby})
    lobbyCodeInput.value = "";
  });
  document.getElementById("join-lobby").addEventListener("click", () => setMenuScreen("joining-lobby"));
  
  document.querySelectorAll(".btn-leave").forEach(btn => btn.addEventListener("click", () => socket.emit("leave")));

  document.getElementById("btn-lobby").addEventListener("click", () => setMenuScreen("lobby"));

  document.getElementById("lobby-code").addEventListener("click", (e) => {
    navigator.clipboard.writeText(e.target.textContent).then(
      () => {
        let label = document.getElementById("lobby-code-copy-label");
        let oldText = label.textContent;
        label.textContent = "Copied!"
        setTimeout(() => label.textContent = oldText, 1000);
      }
    );
  });

  for (let backBtn of document.querySelectorAll(".btn-back")) {
    backBtn.addEventListener("click", () => setMenuScreen("main-menu"))
  }
}

/**
 * Apply the board changes to the given board in place
 * @param {Object[]} board        Board to apply changes to
 * @param {Object[]} boardChanges Changes to the board
 */
function applyBoardChanges(board, boardChanges) {
  for (let change of boardChanges) {
    board[change.x][change.y] = change;
  }
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
    playerList.append(playerNode);

    playerLi.append(document.createTextNode(player));
    if (host == player) playerLi.append(document.createTextNode(" (host)"));
    if (myName == player) playerLi.append(document.createTextNode(" (you)"));
  }
}

init();