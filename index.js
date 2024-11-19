const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to parse JSON
app.use(express.json());

// Store messages in-memory for this example
const messages = [];

// RESTful API endpoint to get all messages
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// RESTful API endpoint to post a new message
app.post('/api/messages', (req, res) => {
    const message = req.body.message;
    const userId = req.body.userId;

    if (message) {
        messages.push(message);
        io.emit('user-chat-' + userId, message);  // Broadcast to all clients
        res.status(201).json({ message: 'Message sent' });
    } else {
        res.status(400).json({ error: 'Message content required' });
    }
});

app.post('/api/notify', (req, res) => {
    const userId = req.body.userId;
    const message = req.body.message;
    
    if (userId && message) {
        messages.push(message);
        io.emit('user-notify-' + userId, message);
        res.status(201).json({ message: 'Message sent' });
    } else {
        res.status(400).json({ error: 'Message content required' });
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 50000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
