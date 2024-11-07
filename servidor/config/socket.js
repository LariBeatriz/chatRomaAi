// config/socket.js
const { chatHandler } = require('../controllers/chatController');

function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('Um usuário se conectou');

        // Lida com eventos de chat
        chatHandler(io, socket);
    });
}

module.exports = { setupSocket };
