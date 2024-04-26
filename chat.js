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

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a room
  socket.on('join room', (roomNumber) => {
    socket.join(roomNumber);
    if (!rooms[roomNumber]) {
      rooms[roomNumber] = [];
    }
    rooms[roomNumber].push(socket.id);
    console.log(roomNumber);
    // Emit the number of users in the room
    io.to(roomNumber).emit('users', { userCount: rooms[roomNumber].length });
  });

  // Handle sending a message to a room
  socket.on('message', (msg, roomNumber) => {
    io.to(roomNumber).emit('chat message', { content: msg });
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    Object.keys(rooms).forEach((roomNumber) => {
      const index = rooms[roomNumber].indexOf(socket.id);
      if (index !== -1) {
        rooms[roomNumber].splice(index, 1);
        // Emit updated user count after a user disconnects
        io.to(roomNumber).emit('users', { userCount: rooms[roomNumber].length });
        if (rooms[roomNumber].length === 0) {
          delete rooms[roomNumber];
        }
      }
    });
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
