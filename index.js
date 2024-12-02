const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = new Server(server);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

// Middleware to parse JSON
app.use(express.json());

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

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
    const location = req.body.location;

    if (message) {
        messages.push(message);
        io.emit('user-chat-' + userId + '-' + location, message);  // Broadcast to all clients
        res.status(201).json({ message: 'Message sent' });
    } else {
        res.status(400).json({ error: 'Message content required' });
    }
});

app.post('/api/notify', (req, res) => {
    const userId = req.body.userId;
    const message = req.body.message;
    const location = req.body.location;
    
    if (userId && message) {
        messages.push(message);
        io.emit('user-notify-' + userId + '-' + location, message);
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
