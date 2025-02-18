const socket = io('https://chat-en-tiempo-real-3kxz.onrender.com');  // ✅ Conexión desde el cliente

let username = '';
const notificationSound = new Audio('/sounds/notification.mp3');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.createElement('div');
typingIndicator.id = "typingIndicator";
messagesContainer.appendChild(typingIndicator);
let typingTimeout;

// Manejar la elección del nombre de usuario
document.getElementById('setUsernameBtn').addEventListener('click', () => {
    username = document.getElementById('usernameInput').value.trim();
    if (username) {
        document.getElementById('username-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        messageInput.focus();  
        socket.emit('user joined', username);
    }
});

// Cuando el usuario envíe un mensaje
document.getElementById('sendBtn').addEventListener('click', () => {
    sendMessage();
});

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && username) {
        const msgObj = { user: username, text: message };
        socket.emit('chat message', msgObj);
        messageInput.value = '';
    }
}

// Recibimos los mensajes del servidor y los mostramos
socket.on('chat message', (msg) => {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (msg.user === username) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
        notificationSound.play();
    }
    
    messageElement.textContent = `${msg.user}: ${msg.text}`;
    
    // Animación de entrada
    messageElement.style.opacity = '0';
    messagesContainer.appendChild(messageElement);
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transition = 'opacity 0.5s';
    }, 100);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Mostrar notificación cuando un usuario se une
socket.on('user joined', (user) => {
    const joinMessage = document.createElement('div');
    joinMessage.classList.add('message', 'join-message');
    joinMessage.textContent = `${user} se unió al chat.`;
    messagesContainer.appendChild(joinMessage);
    scrollToBottom();
});

// Mostrar notificación cuando un usuario se desconecta
socket.on('user left', (message) => {
    const leaveMessage = document.createElement('div');
    leaveMessage.classList.add('message', 'leave-message');
    leaveMessage.textContent = message;
    messagesContainer.appendChild(leaveMessage);
    scrollToBottom();
});

// Función para hacer scroll automático al último mensaje
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Manejo del indicador "Escribiendo..."
messageInput.addEventListener('input', () => {
    socket.emit('typing', username);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop typing');
    }, 1000);
});

socket.on('typing', (user) => {
    typingIndicator.textContent = `${user} está escribiendo...`;
});

socket.on('stop typing', () => {
    typingIndicator.textContent = "";
});

socket.on('update users', (users) => {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';  // Limpiar la lista
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
});

