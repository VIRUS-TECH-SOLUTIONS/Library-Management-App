const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library_db'
});

// Books routes
app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books ORDER BY title', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/books', (req, res) => {
  const { title, author, status } = req.body;
  db.query('INSERT INTO books (title, author, status) VALUES (?, ?, ?)', 
    [title, author, status || 'available'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, title, author, status: status || 'available' });
  });
});

app.put('/api/books/:id', (req, res) => {
  const { title, author, status } = req.body;
  db.query('UPDATE books SET title = ?, author = ?, status = ? WHERE id = ?',
    [title, author, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Book updated' });
  });
});

app.delete('/api/books/:id', (req, res) => {
  db.query('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Book deleted' });
  });
});

// Borrowers routes
app.get('/api/borrowers', (req, res) => {
  db.query(`SELECT b.*, bk.title, bk.author FROM borrowers b 
    JOIN books bk ON b.book_id = bk.id 
    ORDER BY b.issue_date DESC`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/borrowers', (req, res) => {
  const { name, book_id } = req.body;
  db.query('INSERT INTO borrowers (name, book_id, issue_date) VALUES (?, ?, NOW())', 
    [name, book_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update book status to borrowed
    db.query('UPDATE books SET status = "borrowed" WHERE id = ?', [book_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, book_id });
    });
  });
});

app.put('/api/borrowers/:id/return', (req, res) => {
  db.query('SELECT book_id FROM borrowers WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const book_id = results[0].book_id;
    
    // Update return date
    db.query('UPDATE borrowers SET return_date = NOW() WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update book status to available
      db.query('UPDATE books SET status = "available" WHERE id = ?', [book_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book returned' });
      });
    });
  });
});

app.listen(5004, () => console.log('Server running on port 5004'));