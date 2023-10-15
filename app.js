const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: null,
  database: 'expense_details'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

app.use(express.json());

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      res.sendStatus(500);
    } else {
      const checkExistingUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
      db.query(checkExistingUserQuery, [username, email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.status(400).send('Username or email already taken');
        } else {
          const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
          db.query(insertUserQuery, [username, email, hash], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
          });
        }
      });
    }
  });
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, email, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      const user = result[0];
      bcrypt.compare(password, user.password, (error, response) => {
        if (response) {
          res.send('Login successful');
        } else {
          res.status(400).send('Wrong password');
        }
      });
    } else {
      res.status(400).send('Email not found');
    }
  });
});
// Create new expense
app.post('/expenses', (req, res) => {
  const { user_id, date, description, amount, transaction_type } = req.body;
  const sql = 'INSERT INTO expenses (user_id, date, description, amount, transaction_type) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id, date, description, amount, transaction_type], (err, result) => {
    if (err) throw err;
    res.send('Expense added successfully');
  });
});

// Get all expenses for a user
app.get('/expenses/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT * FROM expenses WHERE user_id = ?';
  db.query(sql, user_id, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Update an expense
app.put('/expenses/:expense_id', (req, res) => {
  const { expense_id } = req.params;
  const { user_id, date, description, amount, transaction_type } = req.body;
  const sql = 'UPDATE expenses SET user_id = ?, date = ?, description = ?, amount = ?, transaction_type = ? WHERE expense_id = ?';
  db.query(sql, [user_id, date, description, amount, transaction_type, expense_id], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send('Expense updated successfully');
    } else {
      res.status(404).send('Expense not found');
    }
  });
});
// Delete an expense
app.delete('/expenses/:expense_id', (req, res) => {
  const { expense_id } = req.params;
  const sql = 'DELETE FROM expenses WHERE expense_id = ?';
  db.query(sql, expense_id, (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send('Expense deleted successfully');
    } else {
      res.status(404).send('Expense not found');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port 3000`));
