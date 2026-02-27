import { Logger } from "../utils/logger.js";

export const errorTracker = (err, req, res, next) => {
  Logger.error("Unhandled Exception Detected", err, { requestId: req.requestId, method: req.method, url: req.url });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
};