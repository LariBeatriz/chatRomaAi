// IMPORTAÇÕES E INSTÂNCIAS
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const { OpenAI } = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '..')));

let onlineUsers = {};
const openaiApiKey = process.env.OPENAI_API_KEY;
const catApiKey = process.env.CAT_API_KEY;

console.log("API Key da OpenAI:", openaiApiKey);
console.log("API Key da TheCatAPI:", catApiKey);

// Função para obter imagem de gato (API TheCatAPI)
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

// Gerenciamento da conexão de novos usuários
io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('onlineUsers', Object.values(onlineUsers));
        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento de mensagens de chat com comandos para texto, imagem e gatos
    socket.on('chat message', async (msgData) => {
        if (msgData.message.startsWith('/texto ')) {
            const userMessage = msgData.message.slice(7);  // Ajuste para '/texto '
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            try {
                const response = await axios.post('http://localhost:3000/openai/chat', { message: userMessage });
                const aiResponse = response.data.response;
                io.emit('chat message', { sender: 'AI Assistant', message: aiResponse });
            } catch (error) {
                console.error("Erro ao processar comando /texto:", error);
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao processar o comando /texto' });
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
        } else if (msgData.message.startsWith('/cat')) {
            const catImageUrl = await getCatImage();
            if (catImageUrl) {
                io.emit('chat message', { sender: 'AI Assistant', message: `<img src="${catImageUrl}" alt="cat image" />` });
            } else {
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao obter a imagem de gato' });
            }

        
        } else if (msgData.message.startsWith('/dog')) {
            try {
                // Requisição para obter uma imagem aleatória de cachorro
                const response = await axios.get('https://dog.ceo/api/breeds/image/random');
                const dogImage = response.data.message; // Recebe a imagem da resposta da API

                // Envia a imagem de cachorro para todos os usuários no chat
                io.emit('chat message', { sender: 'Dog Bot', message: `<img src="${dogImage}" alt="Dog" />` });
            } catch (error) {
                console.error("Erro ao buscar imagem de cachorro:", error.response ? error.response.data : error.message);
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao buscar imagem de cachorro.' });
            }
        }else {
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

// Endpoint de teste da OpenAI
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

// Endpoint para o chat da OpenAI
app.post('/openai/chat', express.json(), async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].message.content.trim();
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erro ao se comunicar com a OpenAI:", error);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    }
});

// Função assíncrona para iniciar o servidor
server.listen(3000, async () => {
    console.log('Servidor rodando na porta 3000');
    const open = (await import('open')).default;
    await open('http://localhost:3000/login');
});

// Rota para página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login', 'index.html'));
});
