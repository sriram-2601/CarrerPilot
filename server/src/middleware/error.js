export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[CareerPilot Error]', err);
  }

  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred'
  });
}
