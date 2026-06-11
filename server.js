import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profileRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Professional Request Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', profileRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GitHub Profile Analyzer API is online.',
    documentation: 'See README.md for list of endpoints.'
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found. Refer to documentation.'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: err.message
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Server is running on port: ${PORT}`);
  console.log(`  Health Check URL: http://localhost:${PORT}/`);
  console.log(`  Profiles API Base: http://localhost:${PORT}/api/profiles`);
  console.log(`===================================================`);
});
