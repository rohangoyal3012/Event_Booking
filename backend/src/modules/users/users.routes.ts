import { Router } from "express";
import multer from "multer";
import { usersController } from "./users.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/me", authenticate, usersController.getProfile);
router.patch("/me", authenticate, usersController.updateProfile);
router.post(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  usersController.updateAvatar,
);
router.get("/me/wishlist", authenticate, usersController.getWishlist);
router.post(
  "/me/wishlist/:eventId",
  authenticate,
  usersController.toggleWishlist,
);

// Admin routes
router.get("/", authenticate, authorize("ADMIN"), usersController.getAllUsers);
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  usersController.getProfile,
);
router.delete(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN"),
  usersController.deactivateUser,
);

export default router;
