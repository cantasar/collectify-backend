import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { UnauthorizedError, AppError } from "../utils/errors";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.header("authorization");

    if (!header) {
      throw new UnauthorizedError("Missing Authorization header");
    }

    const token = header.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Invalid Authorization header");
    }

    const decoded = await auth.verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
