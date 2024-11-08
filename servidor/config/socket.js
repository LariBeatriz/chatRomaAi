// Importa o manipulador de eventos de chat do controlador de chat
const { chatHandler } = require('../controllers/chatController');

// Função para configurar o WebSocket com o servidor
function setupSocket(io) {
    // Define o que acontece quando um cliente se conecta ao WebSocket
    io.on('connection', (socket) => {
        console.log('Um usuário se conectou'); // Log de nova conexão de usuário

        // Chama o manipulador de eventos de chat, passando o io e o socket para gerenciar eventos de chat
        chatHandler(io, socket);
    });
}

// Exporta a função setupSocket para ser usada em outras partes da aplicação
module.exports = { setupSocket };
