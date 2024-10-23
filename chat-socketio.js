const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("Usuário Conectado! " + socket.id);

  socket.on("message", (msgData) => {
    console.log(`${msgData.sender}: ${msgData.message}`);
    io.emit("message", msgData); // Envia a mensagem para todos os clientes junto com o nome
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/chat-socketio.html");
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});