const socket = io(); // Inicializa a conexão com o servidor via Socket.io

// Recupera o nome do usuário do localStorage
const username = localStorage.getItem('username') || 'Usuário Anônimo';

// Informa ao servidor que o usuário se conectou
socket.emit('userConnected', username);

// Exibir mensagens recebidas no lado esquerdo ou direito com o nome e a hora
socket.on("chat message", (msgData) => {
    // Exibir a mensagem apenas se não for do usuário atual
    if (msgData.sender !== username) {
        exibirMensagem(msgData);
    }
});

// Atualizar a lista de usuários online
socket.on("onlineUsers", (users) => {
    const onlineUsersUl = document.getElementById('onlineUsers');
    onlineUsersUl.innerHTML = ''; // Limpar a lista de usuários antes de atualizar

    // Adicionar cada usuário à lista de usuários online
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        onlineUsersUl.appendChild(li);
    });
});

// Função para enviar mensagens
function enviar() {
    const input = document.querySelector('#msgInput');
    const msg = input.value;

    if (msg.trim() !== "") {
        // Exibir a mensagem do usuário localmente antes de enviar
        exibirMensagem({ sender: username, message: msg });

        // Enviar a mensagem para o servidor com o nome do usuário
        socket.emit("chat message", { sender: username, message: msg });
        input.value = "";
    }
}

// Função para exibir mensagens
function exibirMensagem(msgData) {
    const ul = document.querySelector('#messages');
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msgData.sender === username) {
        li.classList.add('sent'); // Classe para mensagens enviadas
    } else {
        li.classList.add('received'); // Classe para mensagens recebidas
    }

    if (msgData.type === 'image') {
        // Se a mensagem for uma imagem, exibe o elemento <img>
        const image = document.createElement('img');
        image.src = msgData.message;
        image.alt = 'Imagem gerada pela AI';
        image.style.maxWidth = '300px'; // Limite de tamanho
        image.style.borderRadius = '8px'; // Bordas arredondadas
        li.appendChild(image);
    } else {
        // Caso contrário, exibe como texto normal
        li.innerHTML = `<strong>${msgData.sender}</strong><br>${msgData.message} <span>${time}</span>`;
    }

    ul.appendChild(li);

    // Rolagem automática para a última mensagem
    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
}

// Evento de teclado para enviar mensagens com ENTER
document.getElementById('msgInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviar();
    }
});
