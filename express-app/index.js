// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Define a port to listen on
const port = process.env.PORT || 3000;

// Define a simple route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World! Welcome to Express.js');
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
