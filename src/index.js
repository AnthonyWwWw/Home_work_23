const express = require('express');
const TodosModel = require('../todo.model');
const mongoose = require('mongoose');
const cors = require('cors');
const connect = mongoose.connect('mongodb+srv://anton160400:Blithart02@homework23.nzf7muk.mongodb.net/?retryWrites=true&w=majority&appName=HomeWork23');
connect.then(() => console.log('Connected!'));
const app = express();

app.listen(5002, () => {
  console.log('Server is running on localhost:5000...')
})
app.use(cors())
app.use(express.json())

app.get('/check_data_on_load', (req, res) => {
    TodosModel.find().then(
        response => {
            if (response && response.length > 0) {
                console.log('Data is available in the database');
                res.send(true);
            } else {
                console.log('No data available in the database');
                res.send(false);
            }
        }
    ).catch(error => {
        console.error('Error checking data in the database:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    });
});


app.get('/todos', (req, res) => {
    TodosModel.find().then(
        response => res.send(response)
    )
});

app.post('/todos', (req, res) => {
    const todo = new TodosModel(req.body);
    todo.save().then(
        response => res.send(response)
    )
})

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    TodosModel.findByIdAndDelete(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ message: 'Todo not found' });
            }
            res.send({ message: 'Todo deleted successfully' });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send({ message: 'Internal Server Error' });
        });
});

  app.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    
    if (!id) {
        return res.status(400).send({ message: 'ID parameter is missing' });
    }

    TodosModel.findById(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ message: 'Todo not found' });
            }
            todo.done = !todo.done;
            return todo.save();
        })
        .then(updatedTodo => res.send(updatedTodo))
        .catch(error => {
            console.error(error);
            res.status(500).send({ message: 'Internal Server Error' });
        });
});
