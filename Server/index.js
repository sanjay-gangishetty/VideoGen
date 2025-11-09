const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');

// Import routes
const videoRoutes = require('./routes/videoRoutes');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({
  origin: config.CORS_ORIGIN
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    appName: config.APP_NAME,
    version: config.VERSION,
    environment: config.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: `Welcome to ${config.APP_NAME}`,
    version: config.VERSION,
    endpoints: {
      health: '/health',
      api: {
        videos: {
          create: 'POST /api/videos',
          list: 'GET /api/videos',
          status: 'GET /api/videos/:id',
          download: 'GET /api/videos/:id/download',
          cancel: 'DELETE /api/videos/:id',
        },
      },
    },
    availableServices: ['heygen', 'veo3', 'kie'],
  });
});

// API Routes
app.use('/api/videos', videoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ${config.APP_NAME}           ║
╚════════════════════════════════════════╝

  Server running on: http://localhost:${PORT}
  Environment: ${config.NODE_ENV}

  📋 Endpoints:
  ├─ Health: http://localhost:${PORT}/health
  ├─ API Docs: http://localhost:${PORT}/
  └─ Videos API: http://localhost:${PORT}/api/videos

  🎥 Available Services: heygen, veo3, kie

  Press CTRL+C to stop
  `);
});
