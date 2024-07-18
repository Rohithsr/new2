const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create task table if not exists
const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTasksTable, (err, result) => {
  if (err) throw err;
  console.log('Tasks table created or already exists');
});

// Routes
app.get('/', (req, res) => {
  res.send('API is working');
});

// Add a task
app.post('/tasks', (req, res) => {
  const { title, due_date } = req.body;
  const query = 'INSERT INTO tasks (title, due_date) VALUES (?, ?)';
  db.query(query, [title, due_date], (err, result) => {
    if (err) throw err;
    res.send('Task added successfully');
  });
});

// Get all tasks
app.get('/tasks', (req, res) => {
  const query = 'SELECT * FROM tasks';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, due_date } = req.body;
  const query = 'UPDATE tasks SET title = ?, due_date = ? WHERE id = ?';
  db.query(query, [title, due_date, id], (err, result) => {
    if (err) throw err;
    res.send('Task updated successfully');
  });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.send('Task deleted successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
