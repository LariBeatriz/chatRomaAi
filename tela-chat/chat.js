const socket = io(); // Inicializa a conexão com o servidor

// Recupera o nome do usuário do localStorage, ou define 'Usuário Anônimo' como padrão se não houver nome armazenado
const username = localStorage.getItem('username') || 'Usuário Anônimo';

// Notifica o servidor que o usuário se conectou
socket.emit('userConnected', username);

// Exibir mensagens recebidas no lado esquerdo ou direito com o nome e a hora
socket.on("chat message", (msgData) => {
    if (msgData.sender !== username) { // Apenas exibe a mensagem se não for do usuário atual
        exibirMensagem(msgData);
    }
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

// Enviar mensagens
function enviar() {
    const input = document.querySelector('#msgInput');
    const msg = input.value;

    if (msg.trim() !== "") { // Verifica se a mensagem não está vazia
        exibirMensagem({ sender: username, message: msg }); // Exibe a mensagem localmente antes de enviar
        // Envia a mensagem ao servidor com o nome do usuário
        socket.emit("chat message", { sender: username, message: msg });
        input.value = ""; // Limpa o campo de entrada
    }
}

// Exibir mensagens
function exibirMensagem(msgData) {
    const ul = document.querySelector('#messages');
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Aplica classes CSS diferentes para mensagens enviadas e recebidas
    if (msgData.sender === username) {
        li.classList.add('sent'); // Classe para mensagens enviadas pelo usuário
    } else {
        li.classList.add('received'); // Classe para mensagens recebidas de outros usuários
    }

    // Verifica se a mensagem é uma imagem
    if (msgData.type === 'image') {
        const image = document.createElement('img');
        image.src = msgData.message;
        image.alt = 'Imagem gerada pela AI';
        image.style.maxWidth = '300px';
        image.style.borderRadius = '8px';
        li.appendChild(image);
    } else {
        // Caso a mensagem seja texto, exibe-a normalmente
        li.innerHTML = `<strong>${msgData.sender}</strong><br>${msgData.message} <span>${time}</span>`;
    }

    ul.appendChild(li);

    // Rolagem automática para a última mensagem
    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Evento: enviar mensagem ao pressionar ENTER
document.getElementById('msgInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviar();
    }
});
