const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 5000;

const GameController = require("./gameController");
new GameController(io);

// app.use("/", express.static("./client/"));

app.get("/up", (req, res) => {
  res.send("Grow server is up and running!");
});

server.listen(port, () => console.log("Server listening on port", port));