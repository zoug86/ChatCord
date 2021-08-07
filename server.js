import express from 'express'
import path from 'path'
import http from 'http'
import { Server as socketio } from 'socket.io'
import formatMessages from './utils/messages.js'
import { userJoin, getCurrentUser, userLeave, getRoomusers } from './utils/users.js'

const app = express()

// setting up socket.io
const server = http.createServer(app)
const io = new socketio(server)

// Set static folder
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'
// Run when client connets
io.on("connection", (socket) => {
    // Get user info when joining a room
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        // Welcome current user
        socket.emit('message', formatMessages(botName, 'Weclome to ChatCord'))

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomusers(user.room)
        })
    });



    // listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessages(user.username, msg));
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessages(botName, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomusers(user.room)
            })
        }

    });

});

const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)) // we changed app to server to use socket.io

app.get('/', (req, res) => {
    res.send('Welcome to our messaging app!')
})