// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON payloads
app.use(express.json());

// Enable CORS
app.use(cors());

// Middleware to log every request
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Static file middleware for images
app.use('/images', express.static('images', {
    fallthrough: false, // Prevents moving to next middleware if file not found
}));

// Error handling for static files
app.use((err, req, res, next) => {
    if (err) {
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: 'Image not found' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        next();
    }
});

// Import routes
const lessonRoutes = require('./routes/lessonRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Use the routes
app.use('/', lessonRoutes);
app.use('/', orderRoutes);

// Simple GET route for the root URL
app.get('/', (req, res) => {
    res.send('Hello World! Welcome to Express.js');
});

// Another route
app.get('/about', (req, res) => {
    res.send('This is the About page');
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Connection to MongoDB
MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
        const db = client.db(); // Select the database
        console.log('Connected to MongoDB Atlas');

        // Store db in app.locals
        app.locals.db = db;

        // Start the server after the database connection is ready
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB Atlas', err);
    });
