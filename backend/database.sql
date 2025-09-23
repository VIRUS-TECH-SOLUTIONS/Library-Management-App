CREATE DATABASE library_db;
USE library_db;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  status ENUM('available', 'borrowed') DEFAULT 'available'
);

CREATE TABLE borrowers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  book_id INT NOT NULL,
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  return_date DATETIME NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);