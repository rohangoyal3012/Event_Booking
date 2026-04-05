import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();
  req.requestId = requestId;

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id,
    };
    if (res.statusCode >= 400) {
      logger.warn(log, "Request completed with error");
    } else {
      logger.info(log, "Request completed");
    }
  });

  next();
}
