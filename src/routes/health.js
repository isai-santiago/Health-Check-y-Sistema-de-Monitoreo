// src/routes/health.js
import express from "express";
import { healthService } from "../services/healthService.js";
import { Logger } from "../utils/logger.js";

const router = express.Router();

// Basic health check - lightweight
router.get("/health", async (req, res) => {
  try {
    const health = await healthService.getLivenessStatus();

    res.status(200).json({
      ...health,
      service: "indaptados-api",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    Logger.error("Basic health check failed", error, { requestId: req.requestId });
    res.status(503).json({
      status: "unhealthy",
      error: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health check - comprehensive
router.get("/health/detailed", async (req, res) => {
  try {
    const health = await healthService.getHealthStatus(true);
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

    res.status(statusCode).json({
      ...health,
      service: "api-health",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    Logger.error("Detailed health check failed", error, { requestId: req.requestId });
    res.status(503).json({
      status: "unhealthy",
      error: "Detailed health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Kubernetes liveness probe
router.get("/live", async (req, res) => {
  try {
    const liveness = await healthService.getLivenessStatus();
    res.status(200).json(liveness);
  } catch (error) {
    Logger.error("Liveness check failed", error);
    res.status(503).json({ status: "dead", error: error.message, timestamp: new Date().toISOString() });
  }
});

// Kubernetes readiness probe
router.get("/ready", async (req, res) => {
  try {
    const readiness = await healthService.getReadinessStatus();
    const statusCode = readiness.status === "ready" ? 200 : 503;
    res.status(statusCode).json(readiness);
  } catch (error) {
    Logger.error("Readiness check failed", error);
    res.status(503).json({ status: "not_ready", error: error.message, timestamp: new Date().toISOString() });
  }
});

// Prometheus metrics endpoint (basic)
router.get("/metrics", async (req, res) => {
  try {
    const health = await healthService.getHealthStatus(false);

    const metrics = [
      `# HELP app_health_status Application health status (1=healthy, 0=unhealthy)`,
      `# TYPE app_health_status gauge`,
      `app_health_status{service="api-health"} ${health.status === "healthy" ? 1 : 0}`,
      "",
      `# HELP app_uptime_seconds Application uptime in seconds`,
      `# TYPE app_uptime_seconds counter`,
      `app_uptime_seconds{service="api-health"} ${Math.floor(process.uptime())}`,
      "",
      `# HELP app_memory_usage_bytes Application memory usage in bytes`,
      `# TYPE app_memory_usage_bytes gauge`,
      `app_memory_usage_bytes{service="api-health"} ${process.memoryUsage().rss}`,
      "",
    ].join("\n");

    res.set("Content-Type", "text/plain");
    res.status(200).send(metrics);
  } catch (error) {
    Logger.error("Metrics endpoint failed", error);
    res.status(500).send("# Error generating metrics");
  }
});

// Ruta para actualizar el Webhook dinámicamente
router.post("/config/webhook", (req, res) => {
  const { url } = req.body;
  
  if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
    return res.status(400).json({ error: "URL de Webhook inválida" });
  }

  // Guardamos en la variable de entorno actual
  process.env.DISCORD_WEBHOOK_URL = url;
  
  Logger.info("Webhook de Discord actualizado correctamente", { url });
  res.status(200).json({ message: "Webhook configurado con éxito" });
});

export default router;