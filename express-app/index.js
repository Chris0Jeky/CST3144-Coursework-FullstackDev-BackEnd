// Import Express.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // This will parse JSON payloads

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next(); // Move to the next middleware or route handler
});

// Simple GET route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World! Welcome to Express.js');
});

// Another route
app.get('/about', (req, res) => {
  res.send('This is the About page');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
