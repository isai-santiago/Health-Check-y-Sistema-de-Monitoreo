import app from "./app.js";
import { Logger } from "./utils/logger.js";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  Logger.info(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  Logger.info(`Health check disponible en: http://localhost:${PORT}/health/detailed`);
});

// Graceful shutdown para Kubernetes/Docker
const gracefulShutdown = () => {
  Logger.info("Señal de apagado recibida. Cerrando servidor HTTP...");
  server.close(() => {
    Logger.info("Servidor HTTP cerrado exitosamente.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);

process.on("SIGINT", gracefulShutdown);

export default app;
