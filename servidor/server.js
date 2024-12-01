// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env para process.env

const express = require('express'); // Importa o framework Express para manipulação de rotas e servidores
const http = require('http'); // Módulo HTTP do Node.js para criar o servidor
const socketIo = require('socket.io'); // Biblioteca Socket.io para comunicação em tempo real
const path = require('path'); // Módulo Path do Node.js para manipulação de caminhos de arquivos

const app = express(); // Cria uma instância do Express
const server = http.createServer(app); // Cria o servidor HTTP usando o Express
const io = socketIo(server); // Inicializa o Socket.io com o servidor HTTP

const { setupSocket } = require('./config/socket'); // Importa a configuração do Socket.io de um módulo externo
setupSocket(io); // Configura e inicializa o Socket.io

// Verifique se as variáveis de ambiente estão carregadas
const openaiApiKey = process.env.OPENAI_API_KEY;
const catApiKey = process.env.CAT_API_KEY;

// Exibe no console se as chaves de API foram configuradas corretamente
console.log("API Key da OpenAI:", openaiApiKey ? "Configurada" : "Não configurada");
console.log("API Key da TheCatAPI:", catApiKey ? "Configurada" : "Não configurada");

// Configuração do Express para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..'))); // Define o diretório raiz para arquivos estáticos

// Rotas
app.use('/api/openai', require('./routes/openaiRoutes')); // Define rota para requisições relacionadas ao OpenAI

// Página inicial
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'index.html')); // Serve o arquivo HTML de login
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000; // Define a porta do servidor, utilizando variável de ambiente ou padrão 3000
server.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`); // Exibe no console a porta em que o servidor está rodando

    // Carrega o módulo `open` de forma dinâmica e abre a página de login
    const open = await import('open'); // Importa dinamicamente o módulo `open` para abrir URLs
    open.default(`https://ideal-space-fishstick-px99jgg59w736p4r-3000.app.github.dev/pages/index.html`); // Abre a URL de login no navegador padrão
});

module.exports = { app, server }; // Exporta a instância do Express e o servidor para outros módulos
