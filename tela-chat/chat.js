const socket = io();// Inicializa a conexão com o servidor via Socket.io

// Recupera o nome do usuário do localStorage
const username = localStorage.getItem('username') || 'Usuário Anônimo';

// Informa ao servidor que o usuário se conectou
socket.emit('userConnected', username);

// Exibir mensagens recebidas no lado esquerdo ou direito com o nome e a hora
socket.on("chat message", (msgData) => {
    const ul = document.querySelector('#messages');
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Verifica se a mensagem foi enviada pelo próprio usuário ou por outra pessoa
    if (msgData.sender === username) {
        li.classList.add('sent'); // Mensagem enviada (lado direito)
    } else {
        li.classList.add('received'); // Mensagem recebida (lado esquerdo)
    }

    // Coloca o nome do usuário em uma linha separada acima da mensagem
    li.innerHTML = `<strong>${msgData.sender}</strong><br>${msgData.message} <span>${time}</span>`;

    ul.appendChild(li);

    // Rolagem automática para a última mensagem
    const container = document.querySelector('.messages-container');
    container.scrollTop = container.scrollHeight;
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
        // Enviar a mensagem para o servidor com o nome do usuário
        socket.emit("chat message", { sender: username, message: msg });
        input.value = "";
    }
}

// Evento de teclado para enviar mensagens com ENTER
document.getElementById('msgInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        enviar();
    }
});
