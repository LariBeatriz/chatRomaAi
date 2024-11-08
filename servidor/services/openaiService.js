// services/openaiService.js
// Importa o módulo axios para fazer requisições HTTP e o módulo OpenAI para interagir com a API da OpenAI
const axios = require('axios');
const { OpenAI } = require('openai');

// Inicializa a instância da API OpenAI com a chave de API a partir das variáveis de ambiente
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para criar uma conclusão de chat usando o modelo GPT-3.5-turbo
async function createChatCompletion(message) {
    // Envia a mensagem do usuário para a API e recebe a resposta
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 150,
        temperature: 0.7
    });
    return completion.choices[0].message.content.trim(); // Retorna a resposta gerada pela IA
}

// Função para processar comandos de texto, emitindo uma resposta do assistente via socket.io
async function processTextCommand(io, msgData) {
    try {
        // Extrai e processa o comando após "/texto"
        const response = await createChatCompletion(msgData.message.slice(7));
        // Emite a resposta do assistente com áudio de resposta
        io.emit('chat message', { sender: '🤖 AI Assistant', message: response, audioPath: '../public/audio/texto.mp3' });
    } catch (error) {
        // Emite uma mensagem de erro caso o processamento falhe
        io.emit('chat message', { sender: 'Sistema', message: 'Erro ao processar comando /texto' });
    }
}

// Função para processar comandos de imagem, usando o modelo DALL-E para gerar uma imagem
async function processImageCommand(io, msgData) {
    try {
        // Extrai o prompt após "/imagem" e gera uma imagem com a API DALL-E
        const prompt = msgData.message.slice(8);
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        });
        const imageUrl = response.data[0].url; // Obtém a URL da imagem gerada
        // Emite a imagem gerada com o assistente via socket.io e um áudio de resposta
        io.emit('chat message', { sender: 'AI Assistant', message: `<img src="${imageUrl}" alt="generated image" />`, audioPath: '../public/audio/imagem.mp3' });
    } catch (error) {
        // Loga um erro caso a geração da imagem falhe
        console.error("Erro ao gerar imagem:", error);
        io.emit('chat message', { sender: 'Sistema', message: 'Erro ao gerar a imagem' });
    }
}

// Exporta as funções para uso em outras partes do código
module.exports = { createChatCompletion, processTextCommand, processImageCommand };