import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthUser } from "../types";

interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw AppError.unauthorized("Access token required");
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;
      req.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role as AuthUser["role"],
        isVerified: payload.isVerified,
      };
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized("Access token expired", "TOKEN_EXPIRED");
      }
      throw AppError.unauthorized("Invalid access token");
    }
  },
);

export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;
      req.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role as AuthUser["role"],
        isVerified: payload.isVerified,
      };
    } catch {
      // Ignore invalid tokens for optional auth
    }
    next();
  },
);
