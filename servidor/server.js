const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');  // Adicionando axios para requisições HTTP
require('dotenv').config();  // Carrega as variáveis do arquivo .env

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve os arquivos estáticos (como chat.html, login.html e socket.io.js)
app.use(express.static(path.join(__dirname, '..')));

// Lista para manter os usuários online
let onlineUsers = {};

const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("API Key da OpenAI:", openaiApiKey);  // Verifique se o token foi carregado corretamente

// Gerenciar a conexão de novos usuários
io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    // Evento disparado quando um usuário se conecta e envia o nome de usuário
    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username;  // Associar o ID do socket ao nome de usuário
        io.emit('onlineUsers', Object.values(onlineUsers));  // Enviar a lista atualizada de usuários online
        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento disparado quando o usuário envia uma mensagem
    socket.on('chat message', async (msgData) => {
        if (msgData.message.startsWith('/text ')) {
            const userMessage = msgData.message.slice(6); // Remove '/text ' do início
            try {
                const response = await axios.post('http://localhost:3000/openai/chat', { message: userMessage });
                const aiResponse = response.data.response;
                io.emit('chat message', { sender: 'AI Assistant', message: aiResponse });
            } catch (error) {
                console.error("Erro ao processar comando /text:", error);
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao processar o comando /text' });
            }
        } else {
            io.emit('chat message', msgData);
        }
    });

    // Evento disparado quando o usuário se desconecta
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id];  // Remover o usuário da lista pelo ID do socket
        io.emit('onlineUsers', Object.values(onlineUsers));  // Enviar a lista atualizada de usuários online
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
        res.json(response.data);  // Retorna a resposta ao cliente
    })
    .catch(error => {
        console.error("Erro ao fazer a requisição:", error);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    });
});

// Novo endpoint para o chat da OpenAI
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

        console.log("Resposta da API OpenAI:", response.data); // Adicione este log
        const aiResponse = response.data.choices[0].message.content.trim();
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erro ao fazer a requisição para a OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    }
});

// Função assíncrona para iniciar o servidor e abrir o navegador
server.listen(3000, async () => {
    console.log('Servidor rodando na porta 3000');
    const open = (await import('open')).default;  // Importação dinâmica
    await open('http://localhost:3000/login');  // Chamada ao open dentro de um contexto assíncrono
});

// Adicione esta rota no final do arquivo
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login', 'index.html'));
});
