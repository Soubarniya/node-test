// src/index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Set port to 3000 or use PORT env variable

app.get('/', (req, res) => {
  const searchTerm = req.query.term; // No input validation or sanitization
  // Potentially vulnerable database query with user input
  const query = `SELECT * FROM users WHERE username = '${searchTerm}'`; // Vulnerable to SQL Injection
  res.send("Hello, GitHub Actions CI!");
});

app.listen(port, () => {
  console.log(`Starting server on port ${port}...`);
});
