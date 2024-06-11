// const express = require('express');
// const app = express();
// const PORT = 4000;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// const http = require("http").Server(app);
// const cors = require("cors")

// const io = require('socket.io')(server, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

// // Set max listeners (optional, if needed)
// io.sockets.setMaxListeners(20);

// io.on('connection', (socket) => {
//     console.log(`${socket.id} user just connected!`);

//     socket.on('taskDragged', (data) => {
//         // Handle task dragged event
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected!');
//     });
// });

// const fetchID = () => Math.random().toString(36).substring(2, 10)

// let tasks = {
//     pending: {
//         title: 'pending',
//         items: [
//             {
//                 id: fetchID(),
//                 title: "Hoover the living room",
//                 comments: []
//             },
//         ],
//     },

//     ongoing: {
//         title: 'ongoing',
//         items: [
//             {
//                 id: fetchID(),
//                 title: 'Going to get groceries',
//                 comments: [
//                     {
//                         text: 'Get groceries from the recipe for potato and leek soup',
//                         id: fetchID(),
//                     },
//                 ],
//             },
//         ],
//     },

//     completed: {
//         title: 'completed',
//         items: [
//             {
//                 id: fetchID(),
//                 title: 'Exercising',
//                 comments: [
//                     {
//                         text: 'Focused on legs and glutes.',
//                         id: fetchID(),
//                     },
//                 ],
//             },
//         ],
//     },
// };

// app.get("/api", (req, res) => {
//     res.json(tasks);
// });

// app.get('./api', (req, res) => {
//     res.json({
//         message: 'Hello World',
//     });
// });

// http.listen(PORT, () => {
//     console.log(`Server listening on ${PORT}!!`)
// });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

let tasks = {
    // Example initial data structure
    pending: {
        title: "Pending",
        items: [
            { id: 1, title: "Task 1", comments: [] },
            { id: 2, title: "Task 2", comments: [] },
        ]
    },
    ongoing: {
        title: "Ongoing",
        items: [
            { id: 3, title: "Task 3", comments: [] },
        ]
    },
    done: {
        title: "Done",
        items: [
            { id: 4, title: "Task 4", comments: [] },
        ]
    }
};

// Sample API route
app.get('/api', (req, res) => {
    res.json(tasks);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on('taskDragged', (data) => {
        // Handle task dragged event
        const { source, destination } = data;

        const itemMoved = {
            ...tasks[source.droppableId].items[source.index]
        };
        console.log('DraggedItem>>> ', itemMoved)

        tasks[source.droppableId].items.splice(source.index, 1)

        tasks[destination.droppableId].items.splice(destination.index, 0, itemMoved)

        socket.emit("tasks", tasks)
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});