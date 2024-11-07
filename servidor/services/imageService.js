// services/imageService.js
// Importa o módulo axios para fazer requisições HTTP
const axios = require('axios');

// Função para buscar uma imagem de gato
async function getCatImage() {
    try {
        // Faz uma requisição para a API de gatos com uma chave de API
        const response = await axios.get('https://api.thecatapi.com/v1/images/search', {
            headers: { 'x-api-key': process.env.CAT_API_KEY }
        });
        return response.data[0].url; // Retorna a URL da imagem de gato
    } catch (error) {
        // Loga um erro caso a requisição falhe
        console.error("Erro ao obter imagem de gato:", error);
        return null;
    }
}

// Função para buscar uma imagem de raposa
async function getFoxImage() {
    try {
        // Faz uma requisição para a API de raposas
        const response = await axios.get('https://randomfox.ca/floof/');
        return response.data.image; // Retorna a URL da imagem de raposa
    } catch (error) {
        // Loga um erro caso a requisição falhe
        console.error("Erro ao obter imagem de raposa:", error);
        return null;
    }
}

// Função para buscar uma imagem de cachorro
async function getDogImage() {
    try {
        // Faz uma requisição para a API de cachorros
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        return response.data.message; // Retorna a URL da imagem de cachorro
    } catch (error) {
        // Loga um erro caso a requisição falhe
        console.error("Erro ao obter imagem de cachorro:", error);
        return null;
    }
}

// Função para buscar informações de um personagem de Rick and Morty
async function getRickAndMortyCharacter(query) {
    try {
        // Define a URL base da API do Rick and Morty
        let url = 'https://rickandmortyapi.com/api/character';
        if (query) {
            // Adiciona o parâmetro de nome à URL se houver uma pesquisa
            url += `/?name=${encodeURIComponent(query)}`;
        }
        const response = await axios.get(url);
        const character = response.data.results[0]; // Obtém o primeiro resultado de personagem

        if (character) {
            // Retorna as informações do personagem traduzidas
            return {
                name: character.name,
                status: traduzirStatus(character.status),
                species: traduzirEspecie(character.species),
                gender: traduzirGenero(character.gender),
                origin: character.origin.name === 'unknown' ? 'Desconhecida' : character.origin.name,
                location: character.location.name === 'unknown' ? 'Desconhecida' : character.location.name,
                image: character.image
            };
        }
        return null;
    } catch (error) {
        // Loga um erro caso a busca do personagem falhe
        console.error("Erro ao buscar personagem:", error);
        return null;
    }
}

// Funções auxiliares para traduzir status, espécie e gênero

// Função para traduzir o status do personagem
function traduzirStatus(status) {
    switch (status.toLowerCase()) {
        case 'alive': return 'Vivo';
        case 'dead': return 'Morto';
        case 'unknown': return 'Desconhecido';
        default: return status;
    }
}

// Função para traduzir o gênero do personagem
function traduzirGenero(gender) {
    switch (gender.toLowerCase()) {
        case 'male': return 'Masculino';
        case 'female': return 'Feminino';
        case 'genderless': return 'Sem Gênero';
        case 'unknown': return 'Desconhecido';
        default: return gender;
    }
}

// Função para traduzir a espécie do personagem
function traduzirEspecie(species) {
    switch (species.toLowerCase()) {
        case 'human': return 'Humano';
        case 'alien': return 'Alienígena';
        case 'humanoid': return 'Humanóide';
        case 'robot': return 'Robô';
        case 'animal': return 'Animal';
        case 'disease': return 'Doença';
        case 'parasite': return 'Parasita';
        case 'unknown': return 'Desconhecido';
        default: return species;
    }
}

// Exporta as funções para uso em outras partes do código
module.exports = { getCatImage, getFoxImage, getDogImage, getRickAndMortyCharacter };