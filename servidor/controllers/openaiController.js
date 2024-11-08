// controllers/openaiController.js
// Importa a função de criação de resposta de chat da OpenAI
const { createChatCompletion } = require('../services/openaiService');

// Função que lida com as requisições de chat para a OpenAI
async function openaiChat(req, res) {
    const { message } = req.body; // Extrai a mensagem do corpo da requisição
    try {
        // Faz uma chamada para criar uma resposta de chat com base na mensagem do usuário
        const aiResponse = await createChatCompletion(message);
        res.json({ response: aiResponse }); // Retorna a resposta da IA em formato JSON
    } catch (error) {
        // Loga o erro caso haja um problema na comunicação com a API da OpenAI
        console.error("Erro ao se comunicar com a API da OpenAI:", error);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' }); // Retorna um erro 500 caso ocorra uma falha
    }
}

// Exporta a função openaiChat para uso em outras partes do código
module.exports = { openaiChat };

