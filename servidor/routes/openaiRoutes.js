// routes/openaiRoutes.js
// Importa o módulo Express e cria um roteador
const express = require('express');
const router = express.Router();

// Importa a função openaiChat do controlador
const { openaiChat } = require('../controllers/openaiController');

// Define uma rota POST para '/chat' que usa a função openaiChat
router.post('/chat', openaiChat);

// Exporta o roteador para uso em outras partes da aplicação
module.exports = router;
