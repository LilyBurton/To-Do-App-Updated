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
        const newTask = { id: fetchID(), title: data.task, comments: [] };
        if (!tasks['pending']) {
            console.error('Category pending does not exist');
            return;
        }
        tasks['pending'].items.push(newTask);

        io.emit('tasks', tasks); // Emit to all connected clients
    });

    socket.on('taskDragged', (data) => {
        const { source, destination } = data;

        console.log('source:', source);
        console.log('destination:', destination);

        if (!tasks[source.droppableId] || !tasks[destination.droppableId]) {
            console.error('Invalid droppableId:', source.droppableId, destination.droppableId);
            return;
        }

        const itemMoved = {
            ...tasks[source.droppableId].items[source.index]
        };
        console.log('DraggedItem>>> ', itemMoved);

        tasks[source.droppableId].items.splice(source.index, 1);
        tasks[destination.droppableId].items.splice(destination.index, 0, itemMoved);

        io.emit("tasks", tasks); // Emit to all connected clients
    });

    socket.on('addComment', (data) => {
        const { comment, category, id, userId } = data;

        if (!tasks[category]) {
            console.error(`Category ${category} does not exist`);
            return;
        }

        const taskItems = tasks[category].items;
        const taskIndex = taskItems.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            console.error(`Task with id ${id} not found in category ${category}`);
            return;
        }

        tasks[category].items[taskIndex].comments.push({ text: comment, userId });

        io.emit("tasks", tasks); // Emit to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Helper function to generate a unique ID
function fetchID() {
    return Math.floor(Math.random() * 1000000);
}