const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Rota para a página de login
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Rota para o chat
app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat-socketio.html")); // Serve a página do chat
});

// Conexão com Socket.IO
io.on('connection', (socket) => {
    console.log("Usuário Conectado: " + socket.id);

    socket.on("message", (msg) => {
        console.log(msg);
        io.emit("message", msg); // Envia a mensagem para todos os clientes conectados
    });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
