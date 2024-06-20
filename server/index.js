const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

let tasks = {
    pending: {
        title: "Pending",
        items: [
            { id: '1', title: "Task 1", comments: [] },
            { id: '2', title: "Task 2", comments: [] },
        ]
    },
    ongoing: {
        title: "Ongoing",
        items: [
            { id: '3', title: "Task 3", comments: [] },
        ]
    },
    done: {
        title: "Done",
        items: [
            { id: '4', title: "Task 4", comments: [] },
        ]
    }
};

const fetchID = (() => {
    let counter = 5;
    return () => {
        return counter++;
    };
})();

app.get('/api', (req, res) => {
    res.json(tasks);
});

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on('createTask', (data) => {
        const newTask = { id: fetchID().toString(), title: data.task, comments: [] };
        tasks['pending'].items.push(newTask);

        io.emit('tasks', tasks);
    });

    socket.on('taskDragged', (data) => {
        const { source, destination } = data;

        console.log('Task dragged - Source:', source);
        console.log('Task dragged - Destination:', destination);

        const sourceId = source.droppableId.toLowerCase();
        const destinationId = destination.droppableId.toLowerCase();

        if (!tasks[sourceId] || !tasks[destinationId]) {
            console.error('Invalid droppableId:', sourceId, destinationId);
            return;
        }

        const itemMoved = {
            ...tasks[sourceId].items[source.index]
        };
        console.log('DraggedItem:', itemMoved);

        tasks[sourceId].items.splice(source.index, 1);
        tasks[destinationId].items.splice(destination.index, 0, itemMoved);

        io.emit("tasks", tasks);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
