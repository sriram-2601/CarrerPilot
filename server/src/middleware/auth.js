import { verifyToken } from '../utils/jwt.js';
import { httpError } from '../utils/httpError.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(httpError(401, 'Authentication token missing or invalid format. Please log in.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return next(httpError(401, 'Invalid or expired session. Please log in again.'));
  }
}
