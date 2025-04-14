const express = require('express');
const rethinkdb = require('rethinkdb');
const path = require('path');
const app = express();
const port = 3000;

let connection = null;
rethinkdb.connect({ host: 'localhost', port: 28015 }, (err, conn) => {
  if (err) throw err;
  connection = conn;
  console.log('RethinkDB Connected');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

rethinkdb.dbList().run(connection, (err, result) => {
  if (err) throw err;
  if (!result.includes('todo_app')) {
    rethinkdb.dbCreate('todo_app').run(connection, () => {});
  }
  rethinkdb.db('todo_app').tableList().run(connection, (err, tables) => {
    if (err) throw err;
    if (!tables.includes('tasks')) {
      rethinkdb.db('todo_app').tableCreate('tasks').run(connection, () => {});
    }
  });
});

app.get('/api/tasks', (req, res) => {
  rethinkdb.db('todo_app').table('tasks').run(connection, (err, cursor) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    cursor.toArray((err, tasks) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(tasks);
    });
  });
});

app.post('/api/tasks', (req, res) => {
  const { task } = req.body;
  rethinkdb.db('todo_app').table('tasks').insert({ task, completed: false }).run(connection, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to add task' });
    res.status(201).json({ success: true });
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  rethinkdb.db('todo_app').table('tasks').get(id).update({ task, completed }).run(connection, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update task' });
    res.json({ success: true });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  rethinkdb.db('todo_app').table('tasks').get(id).delete().run(connection, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete task' });
    res.json({ success: true });
  });
});

app.get('/api/tasks/search', (req, res) => {
  const { query } = req.query;
  rethinkdb.db('todo_app').table('tasks').filter(r => r('task').match(query)).run(connection, (err, cursor) => {
    if (err) return res.status(500).json({ error: 'Search failed' });
    cursor.toArray((err, tasks) => {
      if (err) return res.status(500).json({ error: 'Search failed' });
      res.json(tasks);
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
