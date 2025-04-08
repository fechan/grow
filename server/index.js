const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: ["https://fredchan.org", "https://frederick.seattle.wa.us"]
  }
});

const port = process.env.PORT || 5000;

const GameController = require("./gameController");
new GameController(io);

app.use("/", (req, res) => res.redirect("https://fredchan.org/grow"));

app.get("/up", (req, res) => {
  res.send("Grow server is up and running!");
});

server.listen(port, () => console.log("Server listening on port", port));