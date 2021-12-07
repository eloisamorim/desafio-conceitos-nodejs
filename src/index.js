const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkAccount = users.some((account) => account.username === username);

  if (!checkAccount) {
    return response.status(404).json({ error: "Username not found" });
  }

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkAccount = users.some((account) => account.username === username);

  if (!checkAccount) {
    const user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };

    users.push(user);

    response.status(201).json(user);
  } else {
    response.status(400).json({ error: "User exists" });
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const [user] = users.filter((account) => account.username === username);

  response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const [account] = users.filter((user) => user.username === username);

  account.todos.push(todo);

  response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;
  let todoUser;

  const [account] = users.filter((user) => user.username === username);
  const todos = account.todos;
  const idExists = todos.some((todo) => todo.id === id);

  if(!idExists) {
    return response.status(404).json({ error: "To-do not found!"})
  }

  for (const todo of account.todos) {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
    }
    todoUser = todo;
  }

  const todoResponse = {
    deadline: todoUser.deadline,
    done: todoUser.done,
    title: todoUser.title,
  };

  response.status(200).json(todoResponse);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  let todoUser;

  const [account] = users.filter((user) => user.username === username);
  const todos = account.todos;

  const existId = todos.some((todo) => todo.id === id);

  if (!existId) {
    response.status(404).json({ error: "Not Found" });
  } else {
    for (const todo of todos) {
      if (todo.id === id) {
        todo.done = true;
      }
      todoUser = todo;
    }

    response.status(200).json(todoUser);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const [account] = users.filter((user) => user.username === username);

  const listSize = account.todos.length;

  for (const todo of account.todos) {
    if (todo.id === id) account.todos.splice(todo, 1);
  }

  const newSize = account.todos.length;

  if (newSize === listSize) {
    return response.status(404).json({ error: "Id not found" });
  }

  response.status(204).json(account.todos);
});

module.exports = app;
