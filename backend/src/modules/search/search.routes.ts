import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { searchService } from "./search.service";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      q = "",
      page,
      limit,
      ...filters
    } = req.query as Record<string, string>;
    const result = await searchService.searchEvents(
      q,
      filters,
      Number(page) || 1,
      Number(limit) || 12,
    );
    res.json({ success: true, ...result });
  }),
);

export default router;
