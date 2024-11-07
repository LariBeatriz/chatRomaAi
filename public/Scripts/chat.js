const socket = io(); // Inicializa a conexão com o servidor

// Recupera o nome do usuário do localStorage, ou define 'Usuário Anônimo' como padrão se não houver nome armazenado
const username = localStorage.getItem('username') || 'Usuário Anônimo';

// Notifica o servidor que o usuário se conectou
socket.emit('userConnected', username);

// Exibir mensagens recebidas no lado esquerdo ou direito com o nome e a hora
socket.on("chat message", (msgData) => {
    exibirMensagem(msgData);

    // Reproduzir som se a mensagem tiver um caminho de áudio
    if (msgData.audioPath) {
        const audio = new Audio(msgData.audioPath);
        audio.play().catch(error => {
            console.error("Erro ao reproduzir o som:", error);
        });
    }

    // Oculta o spinner quando a mensagem é recebida
    hideBotLoading();
});

// Exibir o spinner de loading quando o evento 'loading' for emitido pelo servidor
socket.on('loading', () => {
    showBotLoading();
});

// Remover o spinner de loading quando o evento 'stopLoading' for emitido pelo servidor
socket.on('stopLoading', () => {
    hideBotLoading();
});

// Atualiza a lista de usuários online
socket.on("onlineUsers", (users) => {
    const onlineUsersUl = document.getElementById('onlineUsers');
    onlineUsersUl.innerHTML = ''; // Limpa a lista antes de atualizá-la

    // Adiciona cada usuário à lista de usuários online
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        onlineUsersUl.appendChild(li);
    });
});

// Adicionar evento para receber histórico de mensagens
socket.on('messageHistory', (history) => {
    const ul = document.querySelector('#messages');
    ul.innerHTML = ''; // Limpar mensagens existentes

    // Exibir cada mensagem do histórico
    history.forEach(msgData => {
        exibirMensagem(msgData);
    });
});

// Enviar mensagens
function enviar() {
    const input = document.querySelector('#msgInput');
    const msg = input.value.trim();

    if (msg !== "") { // Verifica se a mensagem não está vazia
        const audioPath = '../public/audio/mensagem.mp3';

        // Exibe imediatamente a mensagem do usuário no chat apenas para comandos
        if (msg.startsWith('/')) {
            exibirMensagem({ sender: username, message: msg, audioPath: audioPath });
        }

        // Envia a mensagem para o servidor para processamento
        socket.emit("chat message", { sender: username, message: msg, audioPath: audioPath });
        
        input.value = ""; // Limpa o campo de entrada
    }
}

// Função para exibir o spinner de loading
function showBotLoading() {
    const ul = document.querySelector('#messages');
    const loadingLi = document.createElement('li');
    loadingLi.id = 'botLoading';
    loadingLi.classList.add('loading');
    
    const spinner = document.createElement('div');
    spinner.classList.add('spinner'); // Adiciona o spinner

    const loadingText = document.createElement('span');
    loadingText.textContent = 'Silêncio, Robozinho Trabalhando...';

    loadingLi.appendChild(spinner);
    loadingLi.appendChild(loadingText);
    ul.appendChild(loadingLi);

    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Função para ocultar o spinner de loading
function hideBotLoading() {
    const loadingLi = document.getElementById('botLoading');
    if (loadingLi) {
        loadingLi.remove();
    }
}

// Exibir mensagens
function exibirMensagem(msgData) {
    const ul = document.querySelector('#messages');
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msgData.sender === username) {
        li.classList.add('sent');
    } else {
        li.classList.add('received');
    }

    if (msgData.message.includes('<div') || msgData.message.includes('<img')) {
        li.innerHTML = `<strong>${msgData.sender}</strong><br>${msgData.message}<span>${time}</span>`;
    } else {
        li.innerHTML = `<strong>${msgData.sender}</strong><br>${msgData.message}<span>${time}</span>`;
    }

    ul.appendChild(li);

    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Evento: enviar mensagem ao pressionar ENTER
document.getElementById('msgInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviar();
    }
});

// Toca o som de saída ao fechar ou recarregar a página
window.addEventListener("beforeunload", function () {
    document.getElementById("exitSound").play();
});
