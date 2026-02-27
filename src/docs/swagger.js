export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Health Check & Monitoring",
    version: "1.0.0",
    description: "Documentación oficial de los endpoints de monitoreo y health checks del sistema.",
    contact: {
      name: "Soporte DevOps"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de Desarrollo"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Estado básico de la API",
        description: "Devuelve el estado liveness muy ligero para balanceadores de carga.",
        responses: {
          "200": {
            description: "Servidor funcionando correctamente",
            content: { "application/json": { example: { status: "alive", uptime: "120s" } } }
          },
          "503": { description: "Servidor no disponible" }
        }
      }
    },
    "/health/detailed": {
      get: {
        summary: "Estado detallado del sistema",
        description: "Ejecuta pruebas en dependencias críticas (DB, Redis) y revisa RAM/Disco.",
        responses: {
          "200": { description: "Todos los sistemas operativos" },
          "503": { description: "Fallo crítico en algún componente" }
        }
      }
    },
    "/live": {
      get: {
        summary: "Liveness Probe (Kubernetes)",
        description: "Indica si el contenedor de la aplicación está vivo y corriendo.",
        responses: { "200": { description: "Vivo" } }
      }
    },
    "/ready": {
      get: {
        summary: "Readiness Probe (Kubernetes)",
        description: "Indica si la aplicación está lista para recibir tráfico HTTP.",
        responses: { "200": { description: "Listo para tráfico" } }
      }
    },
    "/metrics": {
      get: {
        summary: "Métricas de Prometheus",
        description: "Expone métricas de rendimiento en texto plano para Prometheus scrapers.",
        responses: { "200": { description: "Métricas generadas" } }
      }
    }
  }
};