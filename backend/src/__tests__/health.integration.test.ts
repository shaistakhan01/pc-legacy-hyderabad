import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("Express app — basic integration", () => {
  const app = createApp();

  it("returns 404 with the expected JSON shape for an unknown route", async () => {
    const res = await request(app).get("/api/v1/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it("rejects a protected route with no Authorization header", async () => {
    const res = await request(app).get("/api/v1/staff");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Authorization/i);
  });

  it("rejects a protected route with a malformed Bearer token", async () => {
    const res = await request(app).get("/api/v1/staff").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("public availability endpoint responds even without auth (validates params correctly)", async () => {
    const res = await request(app).get("/api/v1/room-bookings/availability");
    expect(res.status).toBe(400);
  });
});