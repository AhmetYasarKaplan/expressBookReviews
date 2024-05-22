const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Write code to check if the username is valid
  return users.includes(username);
}

const authenticatedUser = (username, password) => {
  // Write code to check if username and password match the one we have in records.
  // For simplicity, let's assume the password is the same as the username
  return users.includes(username) && username === password;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user is valid and authenticated
  if (isValid(username) && authenticatedUser(username, password)) {
    // Generate JWT token
    const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.query;
    const username = req.session.username;
  
    if (!review) {
      return res.status(400).json({ message: "Review query parameter is required" });
    }
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has already reviewed the book
    if (books[isbn].reviews[username]) {
      // Modify the existing review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review modified successfully" });
    } else {
      // Add a new review
      books[isbn].reviews[username] = review;
      return res.status(201).json({ message: "Review added successfully" });
    }
  });
  
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has reviewed the book
    if (books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
