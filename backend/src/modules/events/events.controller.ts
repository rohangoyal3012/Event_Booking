import { Request, Response } from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { eventsService } from "./events.service";
import { AppError } from "../../utils/AppError";

export const eventsController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await eventsService.getAll(req.query as never, req.user?.id);
    res.json({ success: true, ...result });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventsService.getBySlug(req.params.slug);
    res.json({ success: true, data: { event } });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventsService.getById(req.params.id);
    res.json({ success: true, data: { event } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventsService.create(req.user!.id, req.body);
    res
      .status(201)
      .json({ success: true, message: "Event created", data: { event } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === "ADMIN";
    const event = await eventsService.update(
      req.params.id,
      req.user!.id,
      req.body,
      isAdmin,
    );
    res.json({ success: true, message: "Event updated", data: { event } });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === "ADMIN";
    const { status, cancellationNote } = req.body;
    const event = await eventsService.updateStatus(
      req.params.id,
      req.user!.id,
      status,
      cancellationNote,
      isAdmin,
    );
    res.json({ success: true, data: { event } });
  }),

  uploadBanner: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest("No file uploaded");
    const event = await eventsService.uploadBanner(
      req.params.id,
      req.user!.id,
      req.file.buffer,
      req.file.mimetype,
    );
    res.json({ success: true, data: { event } });
  }),

  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const events = await eventsService.getFeatured();
    res.json({ success: true, data: { events } });
  }),

  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await eventsService.getCategories();
    res.json({ success: true, data: { categories } });
  }),
};
