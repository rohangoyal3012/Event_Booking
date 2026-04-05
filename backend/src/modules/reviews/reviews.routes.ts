import { z } from "zod";
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/authenticate";
import { validateBody } from "../../middleware/validate";
import { AppError } from "../../utils/AppError";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  body: z.string().max(2000).optional(),
});

const router = Router();

router.post(
  "/events/:eventId",
  authenticate,
  validateBody(createReviewSchema),
  asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user!.id;

    // Check user attended event
    const booking = await prisma.booking.findFirst({
      where: { userId, eventId, status: "CONFIRMED" },
    });
    if (!booking)
      throw AppError.forbidden(
        "You must have attended this event to leave a review",
      );

    const review = await prisma.review.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: req.body,
      create: { userId, eventId, ...req.body },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, data: { review } });
  }),
);

router.get(
  "/events/:eventId",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { eventId: req.params.eventId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { eventId: req.params.eventId } }),
    ]);

    const avg = await prisma.review.aggregate({
      where: { eventId: req.params.eventId },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      data: reviews,
      meta: { page, limit, total, avgRating: avg._avg.rating ?? 0 },
    });
  }),
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });
    if (!review) throw AppError.notFound("Review");
    if (review.userId !== req.user!.id && req.user!.role !== "ADMIN")
      throw AppError.forbidden();

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Review deleted" });
  }),
);

export default router;
