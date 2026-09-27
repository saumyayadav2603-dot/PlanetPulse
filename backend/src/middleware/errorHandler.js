export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Something went wrong.'

  res.status(statusCode).json({
    success: false,
    message,
  })
}
