require('dotenv').config();
const express = require('express');
const path = require('path'); // Import path module
const cors = require('cors'); // Often needed for frontend-backend interaction
const morgan = require('morgan'); // For logging HTTP requests

// Import routes
const authRoutes = require('./routes/authRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const bankIdRoutes = require('./routes/bankIdRoutes'); // Newly added BankID routes

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan('dev')); // Use morgan for request logging in development
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/bankid', bankIdRoutes); // Mount BankID routes

// Basic error handling middleware (example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Define a port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Catch-all GET route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1)); // Optional: close server gracefully
});

module.exports = app; // Export app for potential testing or other uses
