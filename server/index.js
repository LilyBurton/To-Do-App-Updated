const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors")

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
})

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`)
    socket.on('disconnect', () => {
        socket.disconnect()
        console.log(`A user disconnected!`)
    })
})

const fetchID = () => Math.random().toString(36).substring(2, 10)

let tasks = {
    pending: {
        title: 'pending',
        items: [
            {
                id: fetchID(),
                title: "Hoover the living room",
                comments: []
            },
        ],
    },

    ongoing: {
        title: 'ongoing',
        items: [
            {
                id: fetchID(),
                title: 'Going to get groceries',
                comments: [
                    {
                        text: 'Get groceries from the recipe for potato and leek soup',
                        id: fetchID(),
                    },
                ],
            },
        ],
    },

    completed: {
        title: 'completed',
        items: [
            {
                id: fetchID(),
                title: 'Exercising',
                comments: [
                    {
                        text: 'Focused on legs and glutes.',
                        id: fetchID(),
                    },
                ],
            },
        ],
    },
};

app.get("/api", (req, res) => {
    res.json(tasks);
});

app.get('./api', (req, res) => {
    res.json({
        message: 'Hello World',
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}!!`)
});