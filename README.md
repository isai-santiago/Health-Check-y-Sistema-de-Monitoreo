# 🏥 API Health Check & Monitoring System Pro

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Un sistema de monitoreo y health check robusto y listo para producción, diseñado para APIs en Node.js/Express. Incluye telemetría en tiempo real, logging estructurado, alertas a Discord y un Dashboard interactivo (NOC).

Pagina VIVO : https://health-check-y-sistema-de-monitoreo-kmqzjzb2y.vercel.app

---

## ✨ Características Principales

- **🛡️ Health Checks Multi-Nivel:** Endpoints `/health`, `/health/detailed`, `/live` y `/ready` compatibles con orquestadores como Kubernetes.
- **📊 Dashboard Interactivo:** Panel de control en tiempo real con gráficas de consumo de CPU/RAM, estado de microservicios y explorador de JSON.
- **🚨 Alertas a Discord:** Integración con Webhooks para notificar caídas críticas del sistema de forma automática.
- **🔌 Circuit Breaker Pattern:** Manejo seguro de fallos en servicios externos (Base de Datos, Redis, etc.) para evitar bloqueos en cascada.
- **📝 Logging Profesional:** Sistema de logs estructurados utilizando `Winston`, guardando historial de peticiones, errores y tiempos de respuesta (Performance Monitor).
- **✅ Testing Automatizado:** Suite de pruebas de integración y rendimiento construida con `Vitest` y `Supertest`.

---

## 🚀 Instalación y Configuración

Sigue estos pasos para correr el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y agrega tu Webhook de Discord (opcional):
```env
PORT=3000
NODE_ENV=development
DISCORD_WEBHOOK_URL=[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)...
```

### 4. Iniciar el servidor (Modo Desarrollo)
```bash
npm run dev
```
El servidor iniciará en `http://localhost:3000`.

---

## 📡 Ejemplos de Uso (Endpoints)

El sistema expone varias rutas para que balanceadores de carga o administradores puedan consultar el estado.

### 🟢 1. Basic Health Check (`/health`)
Comprobación ligera ideal para saber si el proceso de Node.js está vivo (Liveness Probe).

**Petición:** `GET /health`

**Respuesta (200 OK):**
```json
{
  "status": "alive",
  "timestamp": "2026-02-27T10:00:00.000Z",
  "uptime": "120s",
  "service": "indaptados-api",
  "environment": "development"
}
```

### 🔵 2. Detailed Health Check (`/health/detailed`)
Comprobación profunda. Evalúa CPU, RAM, Disco y servicios dependientes simulados (Base de Datos, Redis).

**Petición:** `GET /health/detailed`

**Respuesta (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:05:00.000Z",
  "duration": "14ms",
  "checks": {
    "total": 5,
    "healthy": 5,
    "unhealthy": 0,
    "critical_failures": 0
  },
  "system": {
    "hostname": "Vitalis-Server",
    "uptime": 300.5,
    "cpu": {
      "count": 12,
      "model": "AMD Ryzen 5 3600 6-Core Processor"
    },
    "memory": {
      "usedPercent": "45.20%"
    }
  },
  "details": [
    {
      "name": "database",
      "status": "healthy",
      "description": "Primary PostgreSQL Database",
      "duration": "12ms"
    }
  ]
}
```

---

## 🖥️ Acceso al Dashboard

Puedes visualizar todas las métricas de forma gráfica accediendo desde tu navegador a:
👉 **`http://localhost:3000/dashboard`**

Desde ahí podrás:
1. Ver el uso de RAM y CPU en una gráfica en vivo.
2. Comprobar qué microservicios están fallando.
3. Vincular tu canal de Discord pegando tu URL de Webhook.

---

## 🧪 Ejecutar Pruebas (Testing)

El proyecto cuenta con una suite completa para garantizar que la API es estable y responde en menos de 100ms. Para ejecutar los tests:

```bash
npm run test
```
