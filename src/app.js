// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express'; // <-- NUEVO
import { swaggerDocument } from './docs/swagger.js'; // <-- NUEVO   
import basicAuth from 'express-basic-auth';

// Import Routes
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js'; // Tu nuevo dashboard

// Import Middlewares
import { requestLogger } from './middlewares/requestLogger.js';
import { performanceMonitor } from './middlewares/performanceMonitor.js';
import { errorTracker } from './middlewares/errorTracker.js';

const app = express();

// 1. Middlewares de Seguridad y Utilidad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Permitimos Tailwind, Chart.js y tus scripts internos
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      // Permitimos estilos de FontAwesome y los internos
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"], // Vital para que el dashboard pida datos a la API
    },
  },
}));
app.use(cors());   
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 2. Middlewares de Observabilidad
app.use(requestLogger);       // Request ID y logging de tráfico
app.use(performanceMonitor);  // Métrica precisa de tiempo de respuesta

// 3. Rutas
// Ruta raíz para evitar el 404 inicial
// Ruta raíz con Landing Page moderna
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Health System</title>
        <link href="/styles.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-slate-900 text-white h-screen flex flex-col items-center justify-center font-sans selection:bg-blue-500 selection:text-white">
        
        <div class="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

        <div class="text-center max-w-2xl px-6">
            <div class="mb-8 inline-block p-4 rounded-full bg-slate-800 shadow-xl border border-slate-700">
                <i class="fa-solid fa-server text-5xl text-blue-400"></i>
            </div>
            <h1 class="text-5xl font-extrabold mb-4 tracking-tight">
                API Health <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Monitor Pro</span>
            </h1>
            <p class="text-lg text-slate-400 mb-10">
                Sistema profesional de monitoreo, métricas y telemetría para tu infraestructura backend.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/dashboard" class="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:scale-105">
                    <i class="fa-solid fa-chart-pie"></i> Ver Dashboard
                </a>
                <a href="/api-docs" class="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:scale-105">
                    <i class="fa-solid fa-book"></i> Swagger UI
                </a>
            </div>
        </div>

        <div class="absolute bottom-8 text-slate-500 text-sm">
            Estado del sistema: <span class="text-emerald-400 font-medium"><i class="fa-solid fa-circle-check"></i> En línea</span>
        </div>
    </body>
    </html>
  `);
});

const authMiddleware = basicAuth({
  users: { 'admin': 'supersecreto123' }, // En producción, usa variables de entorno
  challenge: true,
  realm: 'API Monitor Area'
});

app.use('/', healthRoutes);
app.use('/', dashboardRoutes);

// NUEVO: Ruta de Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    error: { // El test busca esta palabra clave
      message: "Not Found",
      requestId: req.requestId || "no-id"
    }
  });
});

// 5. Global Error Handler (SIEMPRE al final)
app.use(errorTracker);

export default app;