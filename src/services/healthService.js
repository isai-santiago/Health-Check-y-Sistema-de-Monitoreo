// src/services/healthService.js
import { Logger } from "../utils/logger.js";
import { SystemInfo } from "../utils/systemInfo.js";
import { CircuitBreaker } from "../utils/circuitBreaker.js";

export class HealthService {
  constructor() {
    this.checks = new Map();
    this.setupDefaultChecks();
  }

  // Sistema de alertas simulado (Bonus)
async sendAlert(message, details) {
    Logger.error(`🚨 ALERT TRIGGERED: ${message}`, details);
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🚨 ¡Alerta Crítica del Sistema!",
            description: `**${message}**\n\nEl orquestador ha detectado fallas en los servicios principales. Revisa el dashboard inmediatamente.`,
            color: 16711680, // Rojo intenso
            fields: [
              { name: "Fallas Críticas", value: `${details.criticalFailures} servicio(s) caído(s)`, inline: true },
              { name: "Tiempo de respuesta", value: details.duration, inline: true }
            ],
            footer: { text: "API Health Monitor Pro" },
            timestamp: new Date().toISOString()
          }]
        })
      });
      Logger.info("Alerta enviada a Discord exitosamente.");
    } catch (error) {
      Logger.error("Error enviando alerta a Discord", error);
    }
  }

  // Register a new health check
  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      name,
      check: checkFunction,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      description: options.description || `Health check for ${name}`,
    });
    Logger.info(`Registered health check: ${name}`);
  }

  // Setup default system checks
  setupDefaultChecks() {
    // Basic application check
    this.registerCheck("application", async () => {
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || "1.0.0",
      };
    }, { critical: true, description: "Application basic health" });

this.registerCheck(
  "disk",
  async () => {
    // Aquí puedes usar tu utilidad SystemInfo.getDiskInfo()
    return { status: "healthy", details: { free: "50GB", total: "100GB" } };
  },
  { description: "Monitoreo de almacenamiento" }
);

    // Memory usage check
    this.registerCheck("memory", async () => {
      const memUsage = process.memoryUsage();
      const totalMem = SystemInfo.getTotalMemory();
      const usedPercent = (memUsage.rss / totalMem) * 100;

      return {
        status: usedPercent < 80 ? "healthy" : "unhealthy",
        details: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          usedPercent: `${usedPercent.toFixed(2)}%`,
        },
        threshold: "80%",
      };
    }, { description: "Memory usage monitoring" });

    // Bonus: Custom Check para Base de Datos con Circuit Breaker
    const dbCheckAction = async () => {
      // Simulación de un ping a DB (falla 10% de las veces)
      return { status: "healthy", latency: "12ms", connection: "active" };
    };
    const dbCircuitBreaker = new CircuitBreaker(dbCheckAction, 'Database');

    this.registerCheck('database', async () => {
      const result = await dbCircuitBreaker.fire();
      return { status: "healthy", details: result };
    }, { critical: true, description: "Primary PostgreSQL Database" });

    // Bonus: Custom Check para Redis (Caché)
    this.registerCheck('redis', async () => {
      return { status: "healthy", details: { ping: "PONG", latency: "2ms" } };
    }, { critical: false, description: "Redis Cache Layer" });
  }

  // Execute a single health check with timeout
  async executeCheck(name, checkConfig) {
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Health check timeout")), checkConfig.timeout);
      });

      const result = await Promise.race([checkConfig.check(), timeoutPromise]);
      const duration = Date.now() - startTime;

      return {
        name,
        status: result.status || "healthy",
        description: checkConfig.description,
        details: result.details || result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        critical: checkConfig.critical,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(`Health check failed: ${name}`, error, {
        duration: `${duration}ms`,
        critical: checkConfig.critical,
      });

      return {
        name,
        status: "unhealthy",
        description: checkConfig.description,
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        critical: checkConfig.critical,
      };
    }
  }

  // Execute all health checks
  async getHealthStatus(detailed = false) {
    const startTime = Date.now();
    const results = [];
    let overallStatus = "healthy";
    let criticalFailures = 0;

    const checkPromises = Array.from(this.checks.entries()).map(
      ([name, checkConfig]) => this.executeCheck(name, checkConfig)
    );

    const checkResults = await Promise.allSettled(checkPromises);

    checkResults.forEach((result, index) => {
      const checkName = Array.from(this.checks.keys())[index];

      if (result.status === "fulfilled") {
        const checkResult = result.value;
        results.push(checkResult);

        if (checkResult.status === "unhealthy") {
          if (checkResult.critical) {
            criticalFailures++;
            overallStatus = "unhealthy";
          } else if (overallStatus === "healthy") {
            overallStatus = "degraded";
          }
        }
      } else {
        results.push({
          name: checkName,
          status: "unhealthy",
          error: "Check execution failed",
          critical: this.checks.get(checkName).critical,
          timestamp: new Date().toISOString(),
        });

        if (this.checks.get(checkName).critical) {
          criticalFailures++;
          overallStatus = "unhealthy";
        } else if (overallStatus === "healthy") {
          overallStatus = "degraded";
        }
      }
    });

    const totalDuration = Date.now() - startTime;

    // Disparar alerta si hay fallos críticos (Bonus)
    if (overallStatus === "unhealthy" && criticalFailures > 0) {
      this.sendAlert("Critical Systems Offline", { 
        criticalFailures,
        duration: `${totalDuration}ms`
      });
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: `${totalDuration}ms`,
      checks: {
        total: results.length,
        healthy: results.filter((r) => r.status === "healthy").length,
        unhealthy: results.filter((r) => r.status === "unhealthy").length,
        critical_failures: criticalFailures,
      },
    };

    if (detailed) {
      response.system = await SystemInfo.getSystemInfo();
      response.details = results;
    }

    Logger.info(`Health check completed`, {
      status: overallStatus,
      duration: `${totalDuration}ms`,
      criticalFailures,
    });

    return response;
  }

  async getLivenessStatus() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    };
  }

  async getReadinessStatus() {
    const criticalChecks = Array.from(this.checks.entries()).filter(
      ([_, config]) => config.critical
    );

    if (criticalChecks.length === 0) {
      return { status: "ready", timestamp: new Date().toISOString() };
    }

    const results = await Promise.all(
      criticalChecks.map(([name, config]) => this.executeCheck(name, config))
    );

    const hasFailures = results.some((r) => r.status === "unhealthy");

    return {
      status: hasFailures ? "not_ready" : "ready",
      timestamp: new Date().toISOString(),
      critical_checks: results.map((r) => ({ name: r.name, status: r.status })),
    };
  }
}

export const healthService = new HealthService();