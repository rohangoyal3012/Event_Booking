import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { config } from "../config";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let code: string | undefined;
  let errors: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = "Validation error";
    errors = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      const field = (err.meta?.target as string[])?.join(", ") ?? "field";
      message = `A record with this ${field} already exists`;
      code = "DUPLICATE_ENTRY";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      code = "NOT_FOUND";
    } else {
      statusCode = 400;
      message = "Database error";
    }
  }

  // Log 5xx errors
  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
    ...(config.NODE_ENV === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
}
