import winston from "winston";
import path from "path";
import fs from "fs";

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: "red", warn: "yellow", info: "green", http: "magenta", debug: "white" };
winston.addColors(colors);

const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, duration, ...meta } = info;
    let logMessage = `${timestamp} [${level}]`;
    if (requestId) logMessage += ` [${requestId}]`;
    if (duration) logMessage += ` (${duration}ms)`;
    logMessage += `: ${message}`;
    if (Object.keys(meta).length > 0) logMessage += `\n  ${JSON.stringify(meta, null, 2)}`;
    return logMessage;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const transports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "debug",
    format: process.env.NODE_ENV === "production" ? productionFormat : developmentFormat,
  }),
];

if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error", format: productionFormat, maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log"), format: productionFormat, maxsize: 5242880, maxFiles: 5 })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  levels,
  format: process.env.NODE_ENV === "production" ? productionFormat : developmentFormat,
  transports,
  exitOnError: false,
});

export class Logger {
  static info(message, meta = {}) { logger.info(message, meta); }
  static error(message, error = null, meta = {}) {
    const errorMeta = error ? { error: { message: error.message, stack: error.stack, name: error.name }, ...meta } : meta;
    logger.error(message, errorMeta);
  }
  static warn(message, meta = {}) { logger.warn(message, meta); }
  static debug(message, meta = {}) { logger.debug(message, meta); }
  static http(message, meta = {}) { logger.http(message, meta); }
  static logRequest(req, res, duration) {
    this.http(`${req.method} ${req.url}`, { requestId: req.requestId, method: req.method, url: req.url, statusCode: res.statusCode, ip: req.ip, duration, timestamp: new Date().toISOString() });
  }
}