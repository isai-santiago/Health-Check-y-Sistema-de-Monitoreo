import { Logger } from "../utils/logger.js";
import { randomUUID } from "crypto";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  req.requestId = req.headers["x-request-id"] || randomUUID();
  res.set("X-Request-ID", req.requestId);

  Logger.info("Incoming request", { requestId: req.requestId, method: req.method, url: req.url, ip: req.ip });

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    Logger.logRequest(req, res, duration);
    if (duration > 1000) Logger.warn("Slow request detected", { requestId: req.requestId, url: req.url, duration: `${duration}ms` });
    if (res.statusCode >= 400) Logger.error("Request error", null, { requestId: req.requestId, statusCode: res.statusCode, duration: `${duration}ms` });
    originalEnd.call(this, chunk, encoding);
  };
  next();
};