const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const users = new Set();  // 🔥 Guardamos los usuarios conectados
require('dotenv').config();
const PORT = process.env.PORT || 3000;



const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));  // Servir archivos estáticos (frontend)

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('user joined', (username) => {
        socket.username = username;
        users.add(username);
        io.emit('user joined', username);
        io.emit('update users', Array.from(users));  // 🔥 Enviamos la lista de usuarios conectados
    });

    // Cuando un usuario envía un mensaje
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);  // Emitir el mensaje a todos
    });

    // Manejar la desconexión
    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('user left', `${socket.username} se ha desconectado`);
            io.emit('update users', Array.from(users));  // 🔥 Enviamos la lista actualizada
        }
    });
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });
    
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });
});



server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

