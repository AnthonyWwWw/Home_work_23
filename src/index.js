const express = require('express');
const cors = require('cors');
const app = express();

app.listen(5002, () => {
    console.log(`Server running on localhost:5002`);
});

app.use(cors());
app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
    res.send(todos)
});

app.post('/todos', (req, res) => {
    console.log(req.body);
    const newTodo = {
        ...req.body,
        id: Math.floor(Math.random() * 100),
    }

    todos.push(newTodo);
    res.send(todos);
})

app.delete('/todos/:id', (req, res) => {
    const id = +req.params.id;
    todos = todos.filter(todo => todo.id !== id);
    res.send({ message: 'Success' });
  })

app.put('/todos/:id', (req, res) => {
    const id = +req.params.id;
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, done: !todo.done };
        }
        return todo;
    });
    res.send(todos);
});
