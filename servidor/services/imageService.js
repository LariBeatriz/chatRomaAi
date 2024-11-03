// services/imageService.js
const axios = require('axios');

// Função para buscar uma imagem de gato
async function getCatImage() {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search', {
            headers: { 'x-api-key': process.env.CAT_API_KEY }
        });
        return response.data[0].url;
    } catch (error) {
        console.error("Erro ao obter imagem de gato:", error);
        return null;
    }
}

// Função para buscar uma imagem de raposa
async function getFoxImage() {
    try {
        const response = await axios.get('https://randomfox.ca/floof/');
        return response.data.image;
    } catch (error) {
        console.error("Erro ao obter imagem de raposa:", error);
        return null;
    }
}

// Função para buscar uma imagem de cachorro
async function getDogImage() {
    try {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        return response.data.message;
    } catch (error) {
        console.error("Erro ao obter imagem de cachorro:", error);
        return null;
    }
}

// Função para buscar informações de um personagem de Rick and Morty
async function getRickAndMortyCharacter(query) {
    try {
        let url = 'https://rickandmortyapi.com/api/character';
        if (query) {
            url += `/?name=${encodeURIComponent(query)}`;
        }
        const response = await axios.get(url);
        const character = response.data.results[0];

        if (character) {
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
        console.error("Erro ao buscar personagem:", error);
        return null;
    }
}

// Funções auxiliares para traduzir status, espécie e gênero
function traduzirStatus(status) {
    switch (status.toLowerCase()) {
        case 'alive': return 'Vivo';
        case 'dead': return 'Morto';
        case 'unknown': return 'Desconhecido';
        default: return status;
    }
}

function traduzirGenero(gender) {
    switch (gender.toLowerCase()) {
        case 'male': return 'Masculino';
        case 'female': return 'Feminino';
        case 'genderless': return 'Sem Gênero';
        case 'unknown': return 'Desconhecido';
        default: return gender;
    }
}

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

module.exports = { getCatImage, getFoxImage, getDogImage, getRickAndMortyCharacter };
