const Lobby = require("./lobby");
const crypto = require("crypto");

module.exports = class GameController {
  constructor(io) {
    this.io = io;
    this.lobbies = {}; // maps room codes to Lobby objects

    io.on("connection", (socket) => {
      console.info("Client connected to server");

      socket.on("joinLobby",   params => this.onJoinLobby(socket, params));
      socket.on("createLobby", params => this.onCreateLobby(socket, params));
      socket.on("startGame",   params => this.onStartGame(socket, params));
      socket.on("playMove",    params => this.onPlayMove(socket, params));
      socket.on("leave",       params => this.onDisconnectOrLeave(socket, params));
      socket.on("disconnect",  params => this.onDisconnectOrLeave(socket, params));
    });
  }

  /**
   * Called when a player joins a lobby with `joinLobby`.
   * 
   * Server will send `lobbyInfoChanged` to everyone already in the lobby
   * and `lobbyJoined` to the new player.
   * @param {String} params.lobby       Lobby code to join (not case sensitive)
   * @param {String} params.playerName  Name of joining player
   */
  onJoinLobby(socket, params) {
    const expected = {"lobby": "string", "playerName": "string"};
    if (!this.#paramsMatchExpected(socket, params, expected)) return;

    const lobbyToJoin = params.lobby.toUpperCase().trim();
    const lobby = this.lobbies[lobbyToJoin];

    if (lobby == undefined) {
      this.sendError(socket, "lobbyNotFound", `Lobby with code ${lobbyToJoin} not found!`)
    }

    const playerName = lobby.addPlayer(params.playerName);
    const lobbyInfo = lobby.getLobbyInfo();

    this.sendLobbyInfoChanged(lobbyInfo);

    socket.data.playerName = playerName;
    socket.data.lobby = lobby;
    socket.join(lobby.lobbyCode);

    console.info(`Player ${params.playerName} joined lobby ${lobby.lobbyCode}`);

    this.sendLobbyJoined(socket, lobbyInfo, playerName);
  }

  /**
   * Called when a player creates a lobby with `createLobby`.
   * 
   * Server will send `lobbyJoined` to the new player, who is made the host.
   * @param {String} params.hostPlayerName Name of player who created the lobby
   */
  onCreateLobby(socket, params) {
    const expected = {"hostPlayerName": "string"};
    if (!this.#paramsMatchExpected(socket, params, expected)) return;

    if (!this.#paramsMatchExpected(socket, params, {"hostPlayerName": "string"})) return;

    const newLobbyCode = crypto.randomBytes(2).toString("hex").toUpperCase();
    const newLobby = new Lobby(newLobbyCode);
    this.lobbies[newLobbyCode] = newLobby;

    const hostPlayerName = newLobby.addPlayer(params.hostPlayerName);
    const lobbyInfo = newLobby.getLobbyInfo();

    socket.data.playerName = hostPlayerName;
    socket.data.lobby = newLobby;
    socket.join(newLobbyCode);

    console.info(`Created room for ${hostPlayerName} with code ${newLobbyCode}`);

    this.sendLobbyJoined(socket, lobbyInfo, hostPlayerName);
  }

  /**
   * Called when the host starts the game with `startGame`
   * 
   * Server will send `gameStateChanged` to all players in the lobby.
   */
  onStartGame(socket, params) {
    if (this.#socketNotInActiveLobby(socket)) return;

    const lobby = socket.data.lobby;
    lobby.startGame();

    this.sendGameStateChanged(lobby.lobbyCode, lobby.game.getGameState());
  }

  /**
   * Called when a player tries to make a move.
   * 
   * Server will send `gameStateChanged` if the move is successful,
   * and an `error` with code `illegalMove` if it's illegal.
   * @param {Object} params See params in `Game.processMove()`
   */
  onPlayMove(socket, params) {
    if (this.#socketNotInActiveLobby(socket)) return;

    const expected = {"type": "string"};
    const optional = {
      "target_x": "number",
      "target_y": "number",
      "from_x": "number",
      "from_y": "number",
    }
    if (!this.#paramsMatchExpected(socket, params, expected, optional)) return;

    const { playerName, lobby } = socket.data;
    
    const success = lobby.game.processMove(
      playerName,
      params.type,
      params.target_x,
      params.target_y,
      params.from_x,
      params.from_y
    );
    console.info(`Processed move for ${playerName}`);

    if (success) {
      this.sendGameStateChanged(lobby.lobbyCode, lobby.game.getGameState(true));
    } else {
      this.sendError(socket, "illegalMove", "You tried to make an illegal move!");
    }
  }

  /**
   * Called when a client disconnects or leaves a lobby
   */
  onDisconnectOrLeave(socket, params) {
    if (this.#socketNotInActiveLobby(socket, false)) return;

    const { playerName, lobby } = socket.data;

    if (lobby) {
      lobby.removePlayer(playerName);
      socket.leave(lobby.lobbyCode);

      if (lobby.getIsStale()) {
        delete this.lobbies[lobby.lobbyCode];
        console.info(`Deleted a stale game`);
      } else {
        this.sendLobbyInfoChanged(lobby.getLobbyInfo());
      }

      socket.data.lobby = undefined;
    }

    console.info("Client disconnected or left a lobby");
  }


  /**
   * Send the game state to players in the lobby
   * @param {String} lobbyCode  Lobby code of lobby to send to
   * @param {Object} gameState  Serializable game state
   */
  sendGameStateChanged(lobbyCode, gameState) {
    this.io.to(lobbyCode).emit("gameStateChanged", {"gameState": gameState});
    console.info(`- Sent changed game state to player in lobby ${lobbyCode}`);
  }

  /**
   * Send details about the lobby (players, host, options) to everyone in it
   * @param {Object} lobbyInfo Lobby information
   */
  sendLobbyInfoChanged(lobbyInfo) {
    this.io.to(lobbyInfo.lobbyCode).emit("lobbyInfoChanged", {"lobbyInfo": lobbyInfo});
    console.info(`- Sent new lobbyInfo to all players in toom ${lobbyInfo.lobbyCode}`);
  }

  /**
   * Send lobby information to a player newly joining a lobby
   * @param {Socket} socket       Joining player's socket
   * @param {Object} lobbyInfo    Details of lobby being joined
   * @param {String} joinedPlayer Name of player who joined the lobby
   */
  sendLobbyJoined(socket, lobbyInfo, joinedPlayer) {
    socket.emit("lobbyJoined", {
      "lobbyInfo": lobbyInfo,
      "joinedPlayer": joinedPlayer
    });
    console.info(`- Sent newly joined room's info to ${joinedPlayer}`);
  }

  /**
   * Send an error to the given socket
   * @param {Socket} socket   Socket to send to
   * @param {String} code     Machine-readable error code
   * @param {String} message  Human-readable error message
   */
  sendError(socket, code, message) {
    socket.emit("error", {
      "code": code,
      "message": message
    });
    console.error(`- Sent ${code} error to socket ${socket.id}`);
  }

  /**
   * Detect if the socket's user has no lobby, and optionally send an error if they have no lobby
   * @param {Socket}  socket    Socket to check
   * @param {Boolean} sendError Whether to send the error. Defaults to true
   * @returns {Boolean} True if the socket is not in a lobby
   */
  #socketNotInActiveLobby(socket, sendError=true) {
    if (socket.data.lobby == undefined) {
      this.sendError(socket, "userNotInLobby", "You were disconnected from the game!");
      return true;
    }

    if (socket.data.lobby.getIsStale()) {
      this.sendError(socket, "userInStaleLobby", "This lobby is closed!");
      return true;
    }

    return false;
  }

  /**
   * Check if all the params in `types` are in `params`, and check they are all the correct types.
   * @param {Socket} socket         Socket to send errors to if the check fails
   * @param {Object} params         Params from incoming websocket message
   * @param {Object} requiredTypes  Object mapping required param names to type names returned by `typeof`
   * @param {Object} optionalTypes  Object mapping optional param names to type names returned by `typeof`
   * @returns {Boolean} True if all the expected params exist and are the right type
   */
  #paramsMatchExpected(socket, params, requiredTypes, optionalTypes={}) {
    for (const [requiredParam, expectedType] of Object.entries(requiredTypes)) {
      if (!(requiredParam in params) || typeof params[requiredParam] !== expectedType) {
        this.sendError(socket, "badRequest", "Client made a bad request!");
        return false;
      }
    }

    for (const [optionalParam, expectedType] of Object.entries(optionalTypes)) {
      if (optionalParam in params && typeof params[optionalParam] !== expectedType) {
        this.sendError(socket, "badRequest", "Client made a bad request!");
        return false;
      }
    }
    return true;
  }
}