/**
 * Centralized Not Found middleware for non-existent API routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    data: null,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    errors: [
      {
        field: 'route',
        message: `Endpoint ${req.originalUrl} does not exist on this server.`,
      },
    ],
  });
}

/**
 * Centralized Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('💥 Unhandled API Error:', err);

  // Handle malformed JSON request bodies cleanly
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Invalid JSON payload in request body.',
      errors: [
        {
          field: 'body',
          message: 'Request body contains malformed JSON.',
        },
      ],
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: err.errors || [
      {
        field: 'server',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
      },
    ],
  });
}

