// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente no início

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const { setupSocket } = require('./config/socket'); // Configuração do Socket.io
setupSocket(io); // Inicializa o Socket.io

// Verifique se as variáveis de ambiente estão carregadas
const openaiApiKey = process.env.OPENAI_API_KEY;
const catApiKey = process.env.CAT_API_KEY;

console.log("API Key da OpenAI:", openaiApiKey ? "Configurada" : "Não configurada");
console.log("API Key da TheCatAPI:", catApiKey ? "Configurada" : "Não configurada");

// Configuração do Express para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Rotas
app.use('/api/openai', require('./routes/openaiRoutes'));

// Página inicial
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'index.html'));
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);

    // Carrega o módulo `open` de forma dinâmica e abre a página de login
    const open = await import('open');
    open.default(`http://localhost:${PORT}/login`);
});

module.exports = { app, server };
