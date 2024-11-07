// controllers/openaiController.js
const { createChatCompletion } = require('../services/openaiService');

async function openaiChat(req, res) {
    const { message } = req.body;
    try {
        const aiResponse = await createChatCompletion(message);
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erro ao se comunicar com a API da OpenAI:", error);
        res.status(500).json({ error: 'Erro ao se comunicar com a API da OpenAI' });
    }
}

module.exports = { openaiChat };
