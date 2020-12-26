const express = require('express');
const app = express();
const server = require('http').createServer(app);
// had to change it from [const io = require('socket.io').listen(server);] to >>>
const io = require('socket.io')(server);
const usernames = []

server.listen(process.env.PORT || 4000);
console.log("Server running on", 4000);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  console.log('Socket connected...');
  socket.on('new user', (data, callback) => {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  // Update usernames
  const updateUsernames = () => {
    io.sockets.emit('usernames', usernames);
  }

  // Send msg
  socket.on('send message', (data) => {
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  // Disconnect socket
  socket.on('disconnect', (data) => {
    if (!socket.username) {
      return;
    }
    usernames.splice(usernames.indexOf(socket.username), 1)
    updateUsernames();

  })
})
