require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

// Initialize database
connectDB();

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles & scripts for React build
    crossOriginEmbedderPolicy: false,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// CORS configuration driven by env var
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback friendly for single web service
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'QuizCraft',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// API 404 handler (matches any /api route not caught above)
app.all('/api/*', notFound);

// SPA fallback: any other non-API GET request serves index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // In development if client build does not exist yet
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>QuizCraft API Server</title></head>
          <body style="font-family:sans-serif;padding:2rem;text-align:center;">
            <h1>QuizCraft API Server is running</h1>
            <p>Frontend is running at <a href="http://localhost:5173">http://localhost:5173</a> in development mode.</p>
            <p>API Health: <a href="/api/health">/api/health</a></p>
          </body>
        </html>
      `);
    }
  });
});

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[QuizCraft Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };

