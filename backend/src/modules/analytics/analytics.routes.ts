import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { analyticsService } from "./analytics.service";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (_req, res) => {
    const stats = await analyticsService.getDashboardStats();
    res.json({ success: true, data: stats });
  }),
);

router.get(
  "/revenue",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const chart = await analyticsService.getRevenueChart(
      Number(req.query.days) || 30,
    );
    res.json({ success: true, data: chart });
  }),
);

router.get(
  "/top-events",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const events = await analyticsService.getTopEvents(
      Number(req.query.limit) || 10,
    );
    res.json({ success: true, data: events });
  }),
);

router.get(
  "/my-stats",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const stats = await analyticsService.getOrganizerStats(req.user!.id);
    res.json({ success: true, data: stats });
  }),
);

export default router;
