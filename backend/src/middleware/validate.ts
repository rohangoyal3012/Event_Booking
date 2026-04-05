import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/AppError";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
        .join("; ");
      throw AppError.badRequest(message, "VALIDATION_ERROR");
    }
    req[part] = result.data;
    next();
  };

export const validateBody = (schema: ZodSchema) => validate(schema, "body");
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
