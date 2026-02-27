import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
describe("API Integration & Middlewares", () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  it("Debe incluir el header X-Request-ID en todas las respuestas", async () => {
    const response = await request(server).get("/health");
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("Debe manejar rutas inexistentes (404) a través del errorTracker", async () => {
    const response = await request(server).get("/ruta-que-no-existe");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error.message).toBe("Not Found");
    expect(response.body.error).toHaveProperty("requestId");
  });
});