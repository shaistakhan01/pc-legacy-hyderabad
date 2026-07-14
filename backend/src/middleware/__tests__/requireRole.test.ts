import { describe, it, expect, vi } from "vitest";
import { requireRole } from "../requireRole.js";
import type { Request, Response } from "express";

function mockReqRes(userRole?: string) {
  const req = { user: userRole ? { id: "u1", email: "test@example.com", role: userRole } : undefined } as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status } as unknown as Response;
  const next = vi.fn();
  return { req, res, next, status, json };
}

describe("requireRole middleware", () => {
  it("calls next() when the user's role is in the allowed list", () => {
    const { req, res, next } = mockReqRes("admin");
    requireRole("admin", "super_admin")(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 403 when the user's role is not in the allowed list", () => {
    const { req, res, next, status, json } = mockReqRes("customer");
    requireRole("admin", "super_admin")(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("returns 401 when no user is attached to the request at all", () => {
    const { req, res, next, status } = mockReqRes(undefined);
    requireRole("admin")(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
  });
});