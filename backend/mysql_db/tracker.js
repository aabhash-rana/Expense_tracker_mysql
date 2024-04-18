const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Establish the database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'abr',
  database: 'EXPENSE_TRACKER',
};

let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database successfully");
  } catch (error) {
    console.error("Error connecting to database: " + error.message);
    process.exit(1);
  }
}

initializeDatabase();

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/add-income', async (req, res) => {
  let { title, amount, date, category, description } = req.body;
  try {
    date = new Date(date).toISOString().split('T')[0];
    const [results] = await db.query(
      'INSERT INTO Incomes (title, amount, date, category, description) VALUES (?, ?, ?, ?, ?)',
      [title, amount, date, category, description]
    );
    res.status(201).send({ id: results.insertId, ...req.body });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get('/get-incomes', async (req, res) => {
  try {
    
    const [rows] = await db.query('SELECT * FROM Incomes');
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete('/delete-income/:id', async (req, res) => {
  const { id } = req.params; // Ensure that 'id' is retrieved from the URL parameter
  try {
    const [result] = await db.query('DELETE FROM Incomes WHERE id = ?',[id]);
    if (result.affectedRows === 0) {
      // No rows affected means no record was found with this ID
      res.status(404).send({ message: "Income not found." });
    } else {
      // Successfully deleted the income
      res.status(204).send({ message: "Income successfully deleted.", id: id });
    }
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response
    res.status(500).send({ message: error.message });
  }
  console.log("Attempting to delete income with ID:", id);
});


app.post('/add-expense', async (req, res) => {
  let{ title, amount, date, category, description } = req.body;
  try {
    date = new Date(date).toISOString().split('T')[0];
    const [results] = await db.query(
      'INSERT INTO Expenses (title, amount, date, category, description) VALUES (?, ?, ?, ?, ?)',
      [title, amount, date, category, description]
    );
    res.status(201).send({ id: results.insertId, ...req.body });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get('/get-expenses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Expenses');
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete('/delete-expense/:id', async (req, res) => {
  const { id } = req.params; // Ensure that 'id' is retrieved from the URL parameter
  try {
    const [result] = await db.query('DELETE FROM Expenses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      // No rows affected means no record was found with this ID
      res.status(404).send({ message: "Expense not found." });
    } else {
      // Successfully deleted the expense
      res.status(204).send({ message: "Expense successfully deleted.", id: id });
    }
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response
    res.status(500).send({ message: error.message });
  }
  console.log("Attempting to delete expense with ID:", id);
});

