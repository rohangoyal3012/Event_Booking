import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { prisma } from "../../config/database";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.register(
      req.body,
      req.ip,
      req.headers["user-agent"],
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(
      req.body,
      req.ip,
      req.headers["user-agent"],
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.json({
      success: true,
      message: "Login successful",
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required" });
    }

    const tokens = await authService.refreshTokens(
      refreshToken,
      req.ip,
      req.headers["user-agent"],
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.json({ success: true, message: "Logged out successfully" });
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!.id);
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.json({ success: true, message: "All sessions terminated" });
  }),

  googleAuth: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens, isNew } = await authService.googleAuth(
      req.body,
      req.ip,
      req.headers["user-agent"],
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.json({
      success: true,
      message: isNew ? "Account created with Google" : "Login successful",
      data: { user, accessToken: tokens.accessToken, isNew },
    });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: { user } });
  }),
};
