// tests/health.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Health Check Endpoints", () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0); // Random port for testing
  });

  afterAll(async () => {
    await server.close();
  });

  describe("GET /health", () => {
    it("should return basic health status", async () => {
      const response = await request(server).get("/health").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body.service).toBe("indaptados-api");
      expect(typeof response.body.uptime).toBe("string");
    });

    it("should include request ID in logs", async () => {
      const requestId = "test-request-123";

      const response = await request(server)
        .get("/health")
        .set("X-Request-ID", requestId)
        .expect(200);

      expect(response.headers["x-request-id"]).toBe(requestId);
    });
  });

  describe("GET /health/detailed", () => {
    it("should return detailed health information", async () => {
      const response = await request(server)
        .get("/health/detailed")
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("duration");
      expect(response.body).toHaveProperty("checks");
      expect(response.body).toHaveProperty("system");
      expect(response.body).toHaveProperty("details");

      // Validate checks object
      expect(response.body.checks).toHaveProperty("total");
      expect(response.body.checks).toHaveProperty("healthy");
      expect(response.body.checks).toHaveProperty("unhealthy");
      expect(response.body.checks).toHaveProperty("critical_failures");

      // Validate system info
      expect(response.body.system).toHaveProperty("hostname");
      expect(response.body.system).toHaveProperty("platform");
      expect(response.body.system).toHaveProperty("nodeVersion");
    });

    it("should include all default health checks", async () => {
      const response = await request(server)
        .get("/health/detailed")
        .expect(200);

      const checkNames = response.body.details.map((check) => check.name);
      expect(checkNames).toContain("application");
      expect(checkNames).toContain("memory");
      expect(checkNames).toContain("disk");
    });
  });

  describe("GET /live", () => {
    it("should return liveness status", async () => {
      const response = await request(server).get("/live").expect(200);

      expect(response.body.status).toBe("alive");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });
  });

  describe("GET /ready", () => {
    it("should return readiness status", async () => {
      const response = await request(server).get("/ready").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(["ready", "not_ready"]).toContain(response.body.status);
    });
  });

  describe("GET /metrics", () => {
    it("should return Prometheus metrics", async () => {
      const response = await request(server).get("/metrics").expect(200);

      expect(response.headers["content-type"]).toContain("text/plain");
      expect(response.text).toContain("app_health_status");
      expect(response.text).toContain("app_uptime_seconds");
      expect(response.text).toContain("app_memory_usage_bytes");
    });
  });

  describe("Error Handling", () => {
    it("should handle health check failures gracefully", async () => {
      // This would require mocking a failing health check
      // For now, we verify the endpoint exists and returns properly
      const response = await request(server).get("/health").expect(200);

      expect(response.body).toHaveProperty("status");
    });
  });
});

// Performance tests
describe("Health Check Performance", () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  it("should respond to basic health check within 100ms", async () => {
    const start = Date.now();

    await request(server).get("/health").expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it("should handle concurrent health checks", async () => {
    const requests = Array(10)
      .fill(null)
      .map(() => request(server).get("/health"));

    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });
});