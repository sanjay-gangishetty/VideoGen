const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const config = require('./config');
const passport = require('./config/passport');

// Import routes
const videoRoutes = require('./routes/videoRoutes');
const creditRoutes = require('./routes/creditRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Middleware setup
// CORS with credentials support for cross-origin authentication
app.use(cors({
  origin: config.AUTH.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Session configuration
app.use(
  session({
    secret: config.AUTH.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: config.AUTH.SESSION_MAX_AGE,
      httpOnly: true,
      secure: config.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
    },
  })
);

// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

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
        credits: {
          balance: 'GET /api/credits',
          deduct: 'POST /api/credits/deduct',
          add: 'POST /api/credits/add',
          history: 'GET /api/credits/history',
        },
      },
    },
    availableServices: ['heygen', 'veo3', 'kie'],
  });
});

// Auth Routes
app.use('/auth', authRoutes);

// API Routes
app.use('/api/videos', videoRoutes);
app.use('/api/credits', creditRoutes);

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
  ├─ Auth: http://localhost:${PORT}/auth/google
  ├─ Videos API: http://localhost:${PORT}/api/videos
  └─ Credits API: http://localhost:${PORT}/api/credits

  🎥 Available Services: heygen, veo3, kie
  💰 Credit System: Enabled
  🔐 Authentication: Google OAuth ${config.AUTH.TEST_MODE ? '(TEST MODE)' : '(Enabled)'}

  Press CTRL+C to stop
  `);
});
