    // IMPORTAÇÕES E INSTÂNCIAS
const express = require('express'); // Framework para criar o servidor
const http = require('http'); // Criar um servidor que possa ser usado com o Socket.io
const socketIo = require('socket.io'); // Comunicação em tempo real
const path = require('path'); // Manipulação de caminhos de diretórios e arquivos
const axios = require('axios'); // Requisições HTTP (Acessar a API da OpenAI)
require('dotenv').config(); // Carrega as variáveis de ambiente

const { OpenAI } = require('openai'); // Importação da biblioteca da OpenAI
const openai = new OpenAI(); // Instância da classe OpenAI (p/ chamadas à API)

const app = express(); // Instância Express que gerencia o aplicativo web
const server = http.createServer(app); // Criação de um servidor HTTP com o Express
const io = socketIo(server); // -> Isso permite a comunicação em tempo real 

app.use(express.static(path.join(__dirname, '..'))); // Servir arquivos estáticos (HTML, CSS, JS)

let onlineUsers = {}; // Armazena os usuários conectados
const openaiApiKey = process.env.OPENAI_API_KEY; // Obtém a chave da API

console.log("API Key da OpenAI:", openaiApiKey);

// Gerenciamento da conexão de novos usuários
io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    // Evento: um novo usuário se conecta e informa seu nome de usuário
    socket.on('userConnected', (username) => {
        onlineUsers[socket.id] = username; // ID da conexão (recebe) Nome de usuário
        io.emit('onlineUsers', Object.values(onlineUsers)); // Atualiza lista de usuários online
        console.log(`${username} se conectou. Usuários online:`, onlineUsers);
    });

    // Evento: mensagens de chat, ccomandos para texto e imagem da OpenAI
    socket.on('chat message', async (msgData) => {
        if (msgData.message.startsWith('/text ')) {
            const userMessage = msgData.message.slice(6); // Remove '/text ' do início da mensagem -> DAR UMA OLHADA
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            try {
                // Faz uma requisição ao endpoint '/openai/chat' para resposta de IA
                const response = await axios.post('http://localhost:3000/openai/chat', { message: userMessage });
                const aiResponse = response.data.response;
                io.emit('chat message', { sender: 'AI Assistant', message: aiResponse });
            } catch (error) {
                console.error("Erro ao processar comando /text:", error);
                io.emit('chat message', { sender: 'Sistema', message: 'Erro ao processar o comando /text' });
            }
        } else if (msgData.message.startsWith('/imagem ')) {
            const prompt = msgData.message.slice(8); // Remove '/imagem ' do início da mensagem -> DAR UMA OLHADA
            io.emit('chat message', { sender: msgData.sender, message: msgData.message });

            // Geração de imagem
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
        } else {
            io.emit('chat message', msgData);
        }
    });

    // Evento: desconexão do usuário
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        delete onlineUsers[socket.id];
        io.emit('onlineUsers', Object.values(onlineUsers));
        console.log(`${disconnectedUser} se desconectou. Usuários online:`, onlineUsers);
    });
});

// Endpoint para testar conexão com a OpenAI com uma mensagem de teste
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

// Endpoint para o chat que envia uma mensagem para a OpenAI e retorna a resposta
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

        console.log("Resposta da API OpenAI:", response.data);
        const aiResponse = response.data.choices[0].message.content.trim();
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erro ao fazer a requisição para a OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    }
});

// Inicia o servidor e abre a página de login automaticamente
server.listen(3000, async () => {
    console.log('Servidor rodando na porta 3000');
    const open = (await import('open')).default;
    await open('http://localhost:3000/login');
});

// Rota para carregar a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login', 'index.html'));
});
