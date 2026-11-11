import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { initializeDatabase, syncDatabase, getDatabaseType } from './config/db.js';
import employeeRoutes from './routes/employeeRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

let initPromise = null;

/**
 * Ensure database connection, schema, and seed data are initialized once per runtime.
 */
export function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export { syncDatabase };

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development server & tools
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable HTTP/CDN response caching on dynamic API endpoints
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Ensure database readiness on serverless cold starts
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

// Request Logger (Development friendly)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: getDatabaseType(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/employees', employeeRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Start Server after Database Initialization
async function startServer() {
  try {
    console.log('⏳ Bootstrapping database...');
    await ensureInitialized();

    const PORT = env.PORT;
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Employee Management API running on: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`👥 Employees API: http://localhost:${PORT}/api/employees`);
      console.log(`💾 Active DB Engine: ${getDatabaseType().toUpperCase()}`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

const isServerlessRuntime = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
);

if (!isServerlessRuntime) {
  startServer();
}

export default app;

