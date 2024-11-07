// controllers/chatController.js
// Importa funções de serviço para obtenção de imagens e processamento de comandos
const { getCatImage, getFoxImage, getDogImage, getRickAndMortyCharacter } = require('../services/imageService');
const { processTextCommand, processImageCommand } = require('../services/openaiService');

// Armazena os usuários online e o histórico de mensagens
let onlineUsers = {};
let messageHistory = [];
const MAX_HISTORY = 50; // Limite de mensagens armazenadas no histórico

// Função principal que gerencia os eventos de chat
function chatHandler(io, socket) {
    // Evento disparado quando um usuário se conecta
    socket.on('userConnected', (username) => {
        // Adiciona o usuário conectado à lista de usuários online
        onlineUsers[socket.id] = username;
        io.emit('onlineUsers', Object.values(onlineUsers)); // Envia lista de usuários online para todos os clientes

        // Envia o histórico de mensagens para o usuário que acabou de se conectar
        socket.emit('messageHistory', messageHistory);

        // Envia uma mensagem de boas-vindas para todos os usuários, incluindo um áudio
        const audioPath = '../public/audio/hello.mp3';
        io.emit('chat message', { sender: 'Sistema', message: `${username} entrou no chat.`, audioPath });

        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento disparado quando um usuário envia uma mensagem
    socket.on('chat message', async (msgData) => {
        // Limita o tamanho do histórico de mensagens
        if (messageHistory.length >= MAX_HISTORY) {
            messageHistory.shift(); // Remove a mensagem mais antiga
        }
        messageHistory.push(msgData); // Adiciona a nova mensagem ao histórico

        // Exibe a mensagem no chat antes de processar comandos
        io.emit('chat message', msgData);

        // Tratamento de comandos específicos baseados no conteúdo da mensagem
        if (msgData.message.startsWith('/texto ')) {
            await processTextCommand(io, msgData); // Processa comando de texto
        } else if (msgData.message.startsWith('/imagem ')) {
            await processImageCommand(io, msgData); // Processa comando de imagem
        } else if (msgData.message.startsWith('/gato')) {
            const catImageUrl = await getCatImage(); // Obtém imagem de gato
            if (catImageUrl) {
                io.emit('chat message', { sender: '😺 Cat Bot', message: `<img src="${catImageUrl}" alt="cat image" />`, audioPath: '../public/audio/gato.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao obter a imagem de gato' });
            }
        } else if (msgData.message.startsWith('/cachorro')) {
            const dogImageUrl = await getDogImage(); // Obtém imagem de cachorro
            if (dogImageUrl) {
                io.emit('chat message', { sender: '🐕 Dog Bot', message: `<img src="${dogImageUrl}" alt="dog image" />`, audioPath: '../public/audio/cachorro.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao buscar imagem de cachorro.' });
            }
        } else if (msgData.message.startsWith('/raposa')) {
            const foxImageUrl = await getFoxImage(); // Obtém imagem de raposa
            if (foxImageUrl) {
                io.emit('chat message', { sender: '🦊 Fox Bot', message: `<img src="${foxImageUrl}" alt="fox image" />`, audioPath: '../public/audio/raposa.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao obter a imagem de raposa.' });
            }
        } else if (msgData.message.startsWith('/rick ')) {
            // Extrai o nome do personagem para busca e obtém dados do personagem do Rick and Morty
            const characterName = msgData.message.slice(6).trim();
            const character = await getRickAndMortyCharacter(characterName);
            if (character) {
                // Exibe as informações do personagem em um card estilizado
                const characterInfo = `
                    <div style="
                        background-color: #f8f9fa;
                        border: 2px solid #dee2e6;
                        padding: 15px;
                        border-radius: 10px;
                        margin: 10px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        max-width: 300px;
                        font-family: Arial, sans-serif;
                        line-height: 1.5;
                        color: #333;
                    ">
                        <div style="text-align: center; margin-bottom: 10px;">
                            <img src="${character.image}" alt="${character.name}" 
                                style="width: 150px; height: auto; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        </div>
                        <div style="text-align: left;">
                            <p style="margin: 5px 0; font-weight: bold;">Nome: <span style="font-weight: normal;">${character.name}</span></p>
                            <p style="margin: 5px 0; font-weight: bold;">Status: <span style="font-weight: normal;">${character.status}</span></p>
                            <p style="margin: 5px 0; font-weight: bold;">Espécie: <span style="font-weight: normal;">${character.species}</span></p>
                            <p style="margin: 5px 0; font-weight: bold;">Gênero: <span style="font-weight: normal;">${character.gender}</span></p>
                            <p style="margin: 5px 0; font-weight: bold;">Origem: <span style="font-weight: normal;">${character.origin}</span></p>
                            <p style="margin: 5px 0; font-weight: bold;">Localização: <span style="font-weight: normal;">${character.location}</span></p>
                        </div>
                    </div>`;
                
                io.emit('chat message', { 
                    sender: 'Rick and Morty Bot', 
                    message: characterInfo,
                    audioPath: '../public/audio/rick.mp3'
                });
            } else {
                io.emit('chat message', { sender: 'Rick and Morty Bot', message: '❌ Personagem não encontrado. Tente outro nome!' });
            }
        }
    });

    // Evento disparado quando um usuário se desconecta
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id]; // Remove o usuário da lista de online
        io.emit('onlineUsers', Object.values(onlineUsers)); // Atualiza a lista de usuários online

        // Envia uma mensagem de saída para os usuários restantes, incluindo um áudio de saída
        const audioPath = '../public/audio/saida.mp3';
        io.emit('chat message', { sender: 'Sistema', message: `${disconnectedUser} saiu do chat.`, audioPath });

        console.log(`${disconnectedUser} se desconectou. Usuários online:`, onlineUsers);
    });
}

// Exporta a função chatHandler para uso em outras partes da aplicação
module.exports = { chatHandler };
