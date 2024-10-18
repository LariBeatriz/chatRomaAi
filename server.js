const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve os arquivos estáticos (como chat.html, login.html e socket.io.js)
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    socket.on('chat message', (msgData) => {
      io.emit('chat message', msgData); // Envia a mensagem junto com o nome do usuário
  });

    socket.on('disconnect', () => {
        console.log('Usuário se desconectou');
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
