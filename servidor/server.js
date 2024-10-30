const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '..')));

let onlineUsers = {};
const openaiApiKey = process.env.OPENAI_API_KEY;
const catApiKey = process.env.CAT_API_KEY;

console.log("API Key da OpenAI:", openaiApiKey);
console.log("API Key da TheCatAPI:", catApiKey);

let messageHistory = [];
const MAX_HISTORY = 50;

async function getCatImage() {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search', {
            headers: { 'x-api-key': catApiKey }
        });
        return response.data[0].url;
    } catch (error) {
        console.error("Erro ao obter imagem de gato:", error);
        return null;
    }
}

function traduzirStatus(status) {
    switch (status.toLowerCase()) {
        case 'alive': return 'Vivo';
        case 'dead': return 'Morto';
        case 'unknown': return 'Desconhecido';
        default: return status;
    }
}

// Função para traduzir o gênero do personagem
function traduzirGenero(gender) {
    switch (gender.toLowerCase()) {
        case 'male': return 'Masculino';
        case 'female': return 'Feminino';
        case 'genderless': return 'Sem Gênero';
        case 'unknown': return 'Desconhecido';
        default: return gender;
    }
}

// Função para traduzir a espécie do personagem
function traduzirEspecie(species) {
    switch (species.toLowerCase()) {
        case 'human': return 'Humano';
        case 'alien': return 'Alienígena';
        case 'humanoid': return 'Humanóide';
        case 'robot': return 'Robô';
        case 'animal': return 'Animal';
        case 'disease': return 'Doença';
        case 'parasite': return 'Parasita';
        case 'unknown': return 'Desconhecido';
        default: return species;
    }
}

async function getRickAndMortyCharacter(query) {
    try {
        let url = 'https://rickandmortyapi.com/api/character';
        if (query) {
            url += `/?name=${encodeURIComponent(query)}`;
        }
        const response = await axios.get(url);
        const character = response.data.results[0];
        
        if (character) {
            return {
                name: character.name,
                status: traduzirStatus(character.status),
                species: traduzirEspecie(character.species),
                gender: traduzirGenero(character.gender),
                origin: character.origin.name === 'unknown' ? 'Desconhecida' : character.origin.name,
                location: character.location.name === 'unknown' ? 'Desconhecida' : character.location.name,
                image: character.image
            };
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar personagem:", error);
        return null;
    }
}

io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('onlineUsers', Object.values(onlineUsers));
        
        socket.emit('messageHistory', messageHistory);
        
        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    socket.on('chat message', async (msgData) => {
        if (messageHistory.length >= MAX_HISTORY) {
            messageHistory.shift();
        }
        messageHistory.push(msgData);

        if (msgData.message.startsWith('/texto ')) {
            const userMessage = msgData.message.slice(7);
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: userMessage }],
                    max_tokens: 150,
                    temperature: 0.7
                });

                const aiResponse = completion.choices[0].message.content.trim();
                io.emit('chat message', { 
                    sender: '🤖 AI Assistant', 
                    message: `<div style="
                        background-color: #f8f9fa;
                        border: 2px solid #dee2e6;
                        padding: 15px;
                        border-radius: 10px;
                        margin: 10px 0;
                        color: #2c3e50;
                        font-family: Arial, sans-serif;
                        line-height: 1.5;
                    ">${aiResponse}</div>` 
                });
            } catch (error) {
                console.error("Erro ao processar comando /texto:", error);
                io.emit('chat message', { 
                    sender: 'Sistema', 
                    message: '❌ Erro ao processar o comando /texto' 
                });
            }
        } else if (msgData.message.startsWith('/imagem ')) {
            const prompt = msgData.message.slice(8);
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            try {
                const response = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                });
                const imageUrl = response.data[0].url;
                io.emit('chat message', { sender: 'AI Assistant', message: `<img src="${imageUrl}" alt="generated image" />` });
            } catch (error) {
                console.error("Erro ao gerar imagem:", error);
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao gerar a imagem' });
            }
        } else if (msgData.message.startsWith('/gato')) {
            const catImageUrl = await getCatImage();
            if (catImageUrl) {
                io.emit('chat message', { 
                    sender: '😺 Cat Bot', 
                    message: `<div style="text-align: center;">
                        <img src="${catImageUrl}" alt="cat image" style="
                            max-width: 300px;
                            border-radius: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            margin: 10px 0;
                        "/>
                    </div>` 
                });
            } else {
                io.emit('chat message', { 
                    sender: 'Sistema', 
                    message: '❌ Erro ao obter a imagem de gato' 
                });
            }
        } else if (msgData.message.startsWith('/cachorro')) {
            try {
                const response = await axios.get('https://dog.ceo/api/breeds/image/random');
                const dogImage = response.data.message;
                io.emit('chat message', { 
                    sender: '🐕 Dog Bot', 
                    message: `<div style="text-align: center;">
                        <img src="${dogImage}" alt="Dog" style="
                            max-width: 300px;
                            border-radius: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            margin: 10px 0;
                        "/>
                    </div>` 
                });
            } catch (error) {
                console.error("Erro ao buscar imagem de cachorro:", error);
                io.emit('chat message', { 
                    sender: 'Sistema', 
                    message: '❌ Erro ao buscar imagem de cachorro.' 
                });
            }
        } else if (msgData.message.startsWith('/rick ')) {
            const characterName = msgData.message.slice(6).trim();
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            try {
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
                        ">
                            <div style="text-align: center; margin-bottom: 10px;">
                                <img src="${character.image}" alt="${character.name}" 
                                    style="width: 200px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            </div>
                            <div style="font-family: Arial, sans-serif;">
                                <p style="font-size: 18px; font-weight: bold; margin: 5px 0; color: #2c3e50;">
                                    ${character.name}
                                </p>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <span style="font-weight: bold;">Status:</span> ${character.status}
                                </p>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <span style="font-weight: bold;">Espécie:</span> ${character.species}
                                </p>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <span style="font-weight: bold;">Gênero:</span> ${character.gender}
                                </p>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <span style="font-weight: bold;">Origem:</span> ${character.origin}
                                </p>
                                <p style="margin: 5px 0; color: #34495e;">
                                    <span style="font-weight: bold;">Localização:</span> ${character.location}
                                </p>
                            </div>
                        </div>
                    `;
                    io.emit('chat message', { 
                        sender: 'Rick and Morty Bot', 
                        message: characterInfo 
                    });
                } else {
                    io.emit('chat message', { 
                        sender: 'Rick and Morty Bot', 
                        message: '❌ Personagem não encontrado. Tente outro nome!' 
                    });
                }
            } catch (error) {
                console.error("Erro ao processar comando /rick:", error);
                io.emit('chat message', { 
                    sender: 'Rick and Morty Bot', 
                    message: '❌ Erro ao buscar informações do personagem. Tente novamente mais tarde.' 
                });
            }
        } else {
            io.emit('chat message', msgData);
        }
    });

    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id];
        io.emit('onlineUsers', Object.values(onlineUsers));
        console.log(`${disconnectedUser} se desconectou. Usuários online:`, onlineUsers);
    });
});

app.get('/openai-test', (req, res) => {
    const headers = {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
    };

    axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: "Say this is a test",
        max_tokens: 5
    }, { headers })
    .then(response => {
        console.log("Resposta da API OpenAI:", response.data);
        res.json(response.data);
    })
    .catch(error => {
        console.error("Erro ao fazer a requisição:", error);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    });
});

app.post('/openai/chat', express.json(), async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
            max_tokens: 150,
            temperature: 0.7
        });

        if (completion && completion.choices && completion.choices[0]) {
            const aiResponse = completion.choices[0].message.content.trim();
            res.json({ response: aiResponse });
        } else {
            throw new Error('Resposta inválida da API');
        }
    } catch (error) {
        console.error("Erro detalhado ao se comunicar com a OpenAI:", error);
        res.status(500).json({ 
            error: 'Erro ao se comunicar com a API da OpenAI',
            details: error.message 
        });
    }
});

server.listen(3000, async () => {
    console.log('Servidor rodando na porta 3000');
    const open = (await import('open')).default;
    await open('http://localhost:3000/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login', 'index.html'));
});

console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Configurada' : 'Não configurada');