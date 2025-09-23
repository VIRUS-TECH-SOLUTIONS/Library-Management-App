import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [bookForm, setBookForm] = useState({ title: '', author: '', status: 'available' });
  const [borrowForm, setBorrowForm] = useState({ name: '', book_id: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchBorrowers();
  }, []);

  const fetchBooks = async () => {
    const response = await fetch('http://localhost:5004/api/books');
    const data = await response.json();
    setBooks(data);
  };

  const fetchBorrowers = async () => {
    const response = await fetch('http://localhost:5004/api/borrowers');
    const data = await response.json();
    setBorrowers(data);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `http://localhost:5004/api/books/${editing}` : 'http://localhost:5004/api/books';
    
    await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookForm)
    });
    
    setBookForm({ title: '', author: '', status: 'available' });
    setEditing(null);
    fetchBooks();
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5004/api/borrowers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(borrowForm)
    });
    
    setBorrowForm({ name: '', book_id: '' });
    fetchBooks();
    fetchBorrowers();
  };

  const handleEdit = (book) => {
    setBookForm({ title: book.title, author: book.author, status: book.status });
    setEditing(book.id);
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5004/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const handleReturn = async (borrowerId) => {
    await fetch(`http://localhost:5004/api/borrowers/${borrowerId}/return`, { method: 'PUT' });
    fetchBooks();
    fetchBorrowers();
  };

  const availableBooks = books.filter(book => book.status === 'available');
  const borrowedBooks = books.filter(book => book.status === 'borrowed');

  return (
    <div className="App">
      <header>
        <h1>📚 Library Management System</h1>
      </header>

      <nav>
        <button onClick={() => setActiveTab('books')} className={activeTab === 'books' ? 'active' : ''}>
          Books ({books.length})
        </button>
        <button onClick={() => setActiveTab('available')} className={activeTab === 'available' ? 'active' : ''}>
          Available ({availableBooks.length})
        </button>
        <button onClick={() => setActiveTab('borrowed')} className={activeTab === 'borrowed' ? 'active' : ''}>
          Borrowed ({borrowedBooks.length})
        </button>
        <button onClick={() => setActiveTab('borrow')} className={activeTab === 'borrow' ? 'active' : ''}>
          Issue Book
        </button>
      </nav>

      {activeTab === 'books' && (
        <div className="section">
          <h2>Manage Books</h2>
          
          <form onSubmit={handleBookSubmit} className="book-form">
            <input
              type="text"
              placeholder="Book Title"
              value={bookForm.title}
              onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={bookForm.author}
              onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
              required
            />
            <select
              value={bookForm.status}
              onChange={(e) => setBookForm({...bookForm, status: e.target.value})}
            >
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
            </select>
            <button type="submit">{editing ? 'Update' : 'Add'} Book</button>
            {editing && (
              <button type="button" onClick={() => {
                setEditing(null);
                setBookForm({ title: '', author: '', status: 'available' });
              }}>Cancel</button>
            )}
          </form>

          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className={`book-card ${book.status}`}>
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
                <span className={`status ${book.status}`}>{book.status}</span>
                <div className="book-actions">
                  <button onClick={() => handleEdit(book)}>Edit</button>
                  <button onClick={() => handleDelete(book.id)} className="delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'available' && (
        <div className="section">
          <h2>Available Books</h2>
          <div className="books-grid">
            {availableBooks.map(book => (
              <div key={book.id} className="book-card available">
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
                <span className="status available">Available</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'borrowed' && (
        <div className="section">
          <h2>Borrowed Books</h2>
          <div className="borrowers-list">
            {borrowers.filter(b => !b.return_date).map(borrower => (
              <div key={borrower.id} className="borrower-card">
                <div className="borrower-info">
                  <h3>{borrower.title}</h3>
                  <p>by {borrower.author}</p>
                  <p>Borrowed by: <strong>{borrower.name}</strong></p>
                  <p>Issue Date: {new Date(borrower.issue_date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleReturn(borrower.id)} className="return-btn">
                  Return Book
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'borrow' && (
        <div className="section">
          <h2>Issue Book</h2>
          
          <form onSubmit={handleBorrowSubmit} className="borrow-form">
            <input
              type="text"
              placeholder="Borrower Name"
              value={borrowForm.name}
              onChange={(e) => setBorrowForm({...borrowForm, name: e.target.value})}
              required
            />
            <select
              value={borrowForm.book_id}
              onChange={(e) => setBorrowForm({...borrowForm, book_id: e.target.value})}
              required
            >
              <option value="">Select Book</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>{book.title} by {book.author}</option>
              ))}
            </select>
            <button type="submit">Issue Book</button>
          </form>

          <h3>Recent Returns</h3>
          <div className="returns-list">
            {borrowers.filter(b => b.return_date).slice(0, 5).map(borrower => (
              <div key={borrower.id} className="return-card">
                <p><strong>{borrower.title}</strong> returned by {borrower.name}</p>
                <p>Returned: {new Date(borrower.return_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;