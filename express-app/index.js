// Load environment variables
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON payloads
app.use(express.json());

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Simple GET route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World! Welcome to Express.js');
});

// Another route
app.get('/about', (req, res) => {
  res.send('This is the About page');
});

const lessonRoutes = require('./routes/lessonRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Use the routes
app.use('/', lessonRoutes);
app.use('/', orderRoutes);

// Connection to MongoDB
let db;

MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
    .then((client) => {
      db = client.db(); // Select the database
      console.log('Connected to MongoDB Atlas');

      // Start the server after the database connection is ready
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB Atlas', err);
    });
