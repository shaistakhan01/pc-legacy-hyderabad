import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

const router = Router();

/**
 * GET /api/v1/health
 * Confirms the Express server is running AND can successfully reach the
 * Supabase project. Returns 200 with supabase: "connected" only if a real
 * round-trip to Supabase succeeds.
 */
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return res.status(503).json({
        success: false,
        server: "running",
        supabase: "unreachable",
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      server: "running",
      supabase: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      server: "running",
      supabase: "unreachable",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;