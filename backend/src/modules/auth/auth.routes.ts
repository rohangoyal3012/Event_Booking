import { Router } from "express";
import { authController } from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authRateLimiter } from "../../middleware/rateLimiter";
import {
  loginSchema,
  registerSchema,
  googleAuthSchema,
} from "./auth.validator";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register,
);
router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login,
);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.post(
  "/google",
  authRateLimiter,
  validateBody(googleAuthSchema),
  authController.googleAuth,
);
router.get("/me", authenticate, authController.me);

export default router;
