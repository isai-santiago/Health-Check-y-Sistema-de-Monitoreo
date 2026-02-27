import { performance } from 'perf_hooks';

export const performanceMonitor = (req, res, next) => {
  const start = performance.now();
  const originalSend = res.send;

  res.send = function (body) {
    if (!res.headersSent) {
      const duration = (performance.now() - start).toFixed(2);
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalSend.call(this, body);
  };
  next();
};