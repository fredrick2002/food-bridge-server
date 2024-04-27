const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // Allow all origins
  },
});

app.use(cors());

const rooms = {}; // Store socket IDs in rooms

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join room', (roomNumber) => {
    socket.join(roomNumber);
    if (!rooms[roomNumber]) {
      rooms[roomNumber] = [];
    }
    rooms[roomNumber].push(socket.id);
    console.log(`User joined room ${roomNumber}`);
    io.to(roomNumber).emit('users', { userCount: rooms[roomNumber].length });
  });

  socket.on('message', (messageData) => {
    const { content, username, roomNumber } = messageData;
    io.to(roomNumber).emit('chat message', { content, username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    Object.keys(rooms).forEach(roomNumber => {
      const index = rooms[roomNumber].indexOf(socket.id);
      if (index !== -1) {
        rooms[roomNumber].splice(index, 1);
        io.to(roomNumber).emit('users', { userCount: rooms[roomNumber].length });
        if (rooms[roomNumber].length === 0) {
          delete rooms[roomNumber];
        }
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
