// controllers/chatController.js
const { getCatImage, getFoxImage, getDogImage, getRickAndMortyCharacter } = require('../services/imageService');
const { processTextCommand, processImageCommand } = require('../services/openaiService');

let onlineUsers = {};
let messageHistory = [];
const MAX_HISTORY = 50;

function chatHandler(io, socket) {
    // Evento para quando o usuário se conecta
    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('onlineUsers', Object.values(onlineUsers));

        socket.emit('messageHistory', messageHistory);

        const audioPath = '../public/audio/hello.mp3';
        io.emit('chat message', { sender: 'Sistema', message: `${username} entrou no chat.`, audioPath });

        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento para quando o usuário envia uma mensagem
    socket.on('chat message', async (msgData) => {
        // Limita o histórico a MAX_HISTORY mensagens
        if (messageHistory.length >= MAX_HISTORY) {
            messageHistory.shift();
        }
        messageHistory.push(msgData);
    
        // Exibe o comando digitado pelo usuário no chat antes de processar o comando
        io.emit('chat message', msgData);
    
        // Emitir a animação de "digitando..."
        io.emit('chat message', { sender: 'IA', message: '🤖 A IA está carregando/digitando...', typing: true });
    
        // Inicia o processamento do comando
        let processedMessage = '';
        
        if (msgData.message.startsWith('/texto ')) {
            await processTextCommand(io, msgData);
        } else if (msgData.message.startsWith('/imagem ')) {
            await processImageCommand(io, msgData);
        } else if (msgData.message.startsWith('/gato')) {
            const catImageUrl = await getCatImage();
            if (catImageUrl) {
                io.emit('chat message', { sender: '😺 Cat Bot', message: `<img src="${catImageUrl}" alt="cat image" />`, audioPath: '../public/audio/gato.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao obter a imagem de gato' });
            }
        } else if (msgData.message.startsWith('/cachorro')) {
            const dogImageUrl = await getDogImage();
            if (dogImageUrl) {
                io.emit('chat message', { sender: '🐕 Dog Bot', message: `<img src="${dogImageUrl}" alt="dog image" />`, audioPath: '../public/audio/cachorro.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao buscar imagem de cachorro.' });
            }
        } else if (msgData.message.startsWith('/raposa')) {
            const foxImageUrl = await getFoxImage();
            if (foxImageUrl) {
                io.emit('chat message', { sender: '🦊 Fox Bot', message: `<img src="${foxImageUrl}" alt="fox image" />`, audioPath: '../public/audio/raposa.mp3' });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: '❌ Erro ao obter a imagem de raposa.' });
            }
        } else if (msgData.message.startsWith('/rick ')) {
            const characterName = msgData.message.slice(6).trim();
            const character = await getRickAndMortyCharacter(characterName);
            if (character) {
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


        // Agora que a mensagem foi processada, remova a animação de "digitando..." e envie a resposta
        io.emit('chat message', { sender: 'IA', message: processedMessage, typing: false });
    });
    
    // Evento para quando o usuário se desconecta
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id];
        io.emit('onlineUsers', Object.values(onlineUsers));

        const audioPath = '../public/audio/saida.mp3';
        io.emit('chat message', { sender: 'Sistema', message: `${disconnectedUser} saiu do chat.`, audioPath });

        console.log(`${disconnectedUser} se desconectou. Usuários online:`, onlineUsers);
    });
}

module.exports = { chatHandler };
