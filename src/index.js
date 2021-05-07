const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (user) {
    request.user = user;
  } else {
    return response.status(404).json({ error: "Usuário não existe!" });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Usuário ja existe!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosAdded = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosAdded);

  return response.status(201).send(todosAdded);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  const todoIndex = user.todos.findIndex(todo => todo.id === id);


  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo);
  } else if (todoIndex === -1) {
    return response.status(404).json({ error: "TODO não encontrado!" });
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todo) {
    todo.done = true;

    return response.json(todo);
  } else if (todoIndex === -1) {
    return response.status(404).json({ error: "TODO não encontrado!" });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex(todo => todo.id === id);

  if (todo === -1) {
    return response.status(404).json({ error: "TODO não foi encontrado!" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).json();
});

module.exports = app;