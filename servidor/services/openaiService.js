// services/openaiService.js
const axios = require('axios');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createChatCompletion(message) {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 150,
        temperature: 0.7
    });
    return completion.choices[0].message.content.trim();
}

async function processTextCommand(io, msgData) {
    try {
        const response = await createChatCompletion(msgData.message.slice(7));
        io.emit('chat message', { sender: '🤖 AI Assistant', message: response, audioPath: '../public/audio/texto.mp3' });
    } catch (error) {
        io.emit('chat message', { sender: 'Sistema', message: 'Erro ao processar comando /texto' });
    }
}

async function processImageCommand(io, msgData) {
    try {
        const prompt = msgData.message.slice(8);
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        });
        const imageUrl = response.data[0].url;
        io.emit('chat message', { sender: 'AI Assistant', message: `<img src="${imageUrl}" alt="generated image" />`, audioPath: '../public/audio/imagem.mp3' });
    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        io.emit('chat message', { sender: 'Sistema', message: 'Erro ao gerar a imagem' });
    }
}


module.exports = { createChatCompletion, processTextCommand, processImageCommand };
