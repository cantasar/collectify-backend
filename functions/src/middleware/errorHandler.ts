import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  void _next;

  if (err instanceof ValidationError) {
    const body: ErrorResponseBody = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  const body: ErrorResponseBody = {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };

  res.status(500).json(body);
};
