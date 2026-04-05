import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { UserRole } from "../types";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(`Access restricted to: ${roles.join(", ")}`);
    }
    next();
  };
