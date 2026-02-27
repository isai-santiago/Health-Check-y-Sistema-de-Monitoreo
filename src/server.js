import app from "./app.js";
import { Logger } from "./utils/logger.js";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// SOLO arranca el servidor manualmente si NO estás en Vercel (Producción)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    Logger.info(`🚀 Servidor ejecutándose localmente en el puerto ${PORT}`);
  });

  // El Graceful shutdown solo tiene sentido en servidores dedicados
  const gracefulShutdown = () => {
    Logger.info("Cerrando servidor...");
    process.exit(0);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

// OBLIGATORIO para Vercel
export default app;
