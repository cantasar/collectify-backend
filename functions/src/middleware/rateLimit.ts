import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  keyGenerator: (req) => req.user?.uid ?? ipKeyGenerator(req.ip ?? "unknown"),
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests",
    },
  },
});
