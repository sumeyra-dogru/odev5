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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

rethinkdb.dbList().run(connection, (err, result) => {
  if (err) throw err;
  if (!result.includes('todo_app')) {
    rethinkdb.dbCreate('todo_app').run(connection, (err, res) => {
      if (err) throw err;
      console.log('Database created');
    });
  }
  rethinkdb.db('todo_app').tableList().run(connection, (err, tables) => {
    if (err) throw err;
    if (!tables.includes('tasks')) {
      rethinkdb.db('todo_app').tableCreate('tasks').run(connection, (err, res) => {
        if (err) throw err;
        console.log('Table created');
      });
    }
  });
});

app.get('/', (req, res) => {
  rethinkdb.db('todo_app').table('tasks').run(connection, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, tasks) => {
      if (err) throw err;
      res.render('index', { tasks: tasks });
    });
  });
});

app.post('/add', (req, res) => {
  const { task } = req.body;
  rethinkdb.db('todo_app').table('tasks').insert({ task: task, completed: false }).run(connection, (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/update', (req, res) => {
  const { id, task, completed } = req.body;
  rethinkdb.db('todo_app').table('tasks').get(id).update({ task, completed: JSON.parse(completed) }).run(connection, (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/delete', (req, res) => {
  const { id } = req.body;
  rethinkdb.db('todo_app').table('tasks').get(id).delete().run(connection, (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/search', (req, res) => {
  const { query } = req.body;
  rethinkdb.db('todo_app').table('tasks').filter(r => r('task').match(query)).run(connection, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, tasks) => {
      if (err) throw err;
      res.render('index', { tasks: tasks });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
