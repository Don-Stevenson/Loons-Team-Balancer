// Error handling for Next.js API routes
function errorHandler(err, req, res) {
  console.error(err.stack)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Resource not found' })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
    return res.status(400).json({ message })
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error',
  })
}

export default errorHandler
