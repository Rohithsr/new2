// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
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

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create tasks table if not exists
const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

// Create users table if not exists
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`;

// Create tables
db.query(createUsersTable, (err, result) => {
  if (err) throw err;
  console.log('Users table created or already exists');
});

db.query(createTasksTable, (err, result) => {
  if (err) throw err;
  console.log('Tasks table created or already exists');
});

// Routes
app.get('/', (req, res) => {
  res.send('API is working');
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      res.status(400).json({ error: 'Failed to register user' });
      return;
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err || results.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.status(200).json({ message: 'Login successful' });
  });
});

// Add a task
app.post('/tasks', (req, res) => {
  const { title, due_date, user_id } = req.body;
  const query = 'INSERT INTO tasks (title, due_date, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, due_date, user_id], (err, result) => {
    if (err) throw err;
    res.send('Task added successfully');
  });
});

// Get all tasks for a user
app.get('/tasks/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = 'SELECT * FROM tasks WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
