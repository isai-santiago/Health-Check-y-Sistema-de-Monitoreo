import { healthService } from "./healthService.js";

export class MonitoringService {
  static async generatePrometheusMetrics() {
    const health = await healthService.getHealthStatus(false);
    
    return [
      `# HELP app_health_status Application health status (1=healthy, 0=unhealthy)`,
      `# TYPE app_health_status gauge`,
      `app_health_status{service="indaptados-api"} ${health.status === "healthy" ? 1 : 0}`,
      ``,
      `# HELP app_uptime_seconds Application uptime in seconds`,
      `# TYPE app_uptime_seconds counter`,
      `app_uptime_seconds{service="indaptados-api"} ${Math.floor(process.uptime())}`,
      ``,
      `# HELP app_memory_usage_bytes Application memory usage in bytes`,
      `# TYPE app_memory_usage_bytes gauge`,
      `app_memory_usage_bytes{service="indaptados-api"} ${process.memoryUsage().rss}`,
      ``
    ].join("\n");
  }
}

// Nota: Si usas esto, deberías actualizar tu route GET /metrics en health.js 
// para que llame a: await MonitoringService.generatePrometheusMetrics()