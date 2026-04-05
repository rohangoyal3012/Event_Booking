import { Router } from "express";
import multer from "multer";
import { eventsController } from "./events.controller";
import {
  authenticate,
  optionalAuthenticate,
} from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
} from "./events.validator";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Public
router.get("/", validateQuery(eventQuerySchema), eventsController.getAll);
router.get("/featured", eventsController.getFeatured);
router.get("/categories", eventsController.getCategories);
router.get("/slug/:slug", optionalAuthenticate, eventsController.getBySlug);
router.get("/:id", optionalAuthenticate, eventsController.getById);

// Organizer/Admin
router.post(
  "/",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  validateBody(createEventSchema),
  eventsController.create,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  validateBody(updateEventSchema),
  eventsController.update,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventsController.updateStatus,
);
router.post(
  "/:id/banner",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  upload.single("banner"),
  eventsController.uploadBanner,
);

export default router;
